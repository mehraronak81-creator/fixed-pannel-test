// A tiny, loss-tolerant parser for Java-style .properties files (server.properties).
// It keeps the original lines so comments, blank lines, ordering, and any keys we do
// not surface in the UI are preserved exactly when we serialize back.

interface PropLine {
    raw: string;
    key: string | null;
    value: string | null;
}

export interface ParsedProperties {
    lines: PropLine[];
    values: Record<string, string>;
}

export const parseProperties = (content: string): ParsedProperties => {
    const lines: PropLine[] = [];
    const values: Record<string, string> = {};

    content.split(/\r?\n/).forEach((raw) => {
        const trimmed = raw.trimStart();
        // Comment or blank line -> preserve verbatim, no key.
        if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('!')) {
            lines.push({ raw, key: null, value: null });
            return;
        }

        const eq = raw.indexOf('=');
        if (eq === -1) {
            lines.push({ raw, key: null, value: null });
            return;
        }

        const key = raw.slice(0, eq).trim();
        const value = raw.slice(eq + 1);
        lines.push({ raw, key, value });
        values[key] = value;
    });

    return { lines, values };
};

// Serialize back, applying `updates`. Keys present in the original file are edited in
// place; new keys are appended at the end.
export const serializeProperties = (parsed: ParsedProperties, updates: Record<string, string>): string => {
    const pending = { ...updates };
    const out = parsed.lines.map((line) => {
        if (line.key !== null && Object.prototype.hasOwnProperty.call(pending, line.key)) {
            const next = pending[line.key];
            delete pending[line.key];
            return `${line.key}=${next}`;
        }
        return line.raw;
    });

    // Any updated key that was not already in the file gets appended.
    Object.keys(pending).forEach((key) => {
        out.push(`${key}=${pending[key]}`);
    });

    return out.join('\n');
};
