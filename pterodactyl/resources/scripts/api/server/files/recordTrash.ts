import http from '@/api/http';

/**
 * Best-effort recording of deleted files into the admin recycle bin.
 *
 * This never rejects: the recycle-bin route is an optional theme extension, so
 * a failure (route not installed, network error) must not affect the file
 * manager's own delete flow. It simply resolves either way.
 */
export default async (uuid: string, directory: string, files: string[]): Promise<void> => {
    if (!files.length) return;

    try {
        await http.post(`/api/client/servers/${uuid}/files/trash-record`, {
            directory,
            files,
        });
    } catch {
        // Intentionally ignored — recycle-bin auditing is non-critical.
    }
};
