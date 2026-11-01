import http, { FractalResponseData } from '@/api/http';

export interface ApiKey {
    identifier: string;
    description: string;
    allowedIps: string[];
    createdAt: Date;
    lastUsedAt: Date | null;
}

export const rawDataToApiKey = (item: FractalResponseData | any): ApiKey => {
    const d = item?.attributes || item || {};
    const created = d.created_at || d.createdAt;
    const lastUsed = d.last_used_at || d.lastUsedAt;

    let createdAt = new Date();
    if (created) {
        const parsed = new Date(created);
        if (!isNaN(parsed.getTime())) {
            createdAt = parsed;
        }
    }

    let lastUsedAt: Date | null = null;
    if (lastUsed) {
        const parsed = new Date(lastUsed);
        if (!isNaN(parsed.getTime())) {
            lastUsedAt = parsed;
        }
    }

    let allowedIps: string[] = [];
    if (Array.isArray(d.allowed_ips)) {
        allowedIps = d.allowed_ips;
    } else if (Array.isArray(d.allowedIps)) {
        allowedIps = d.allowedIps;
    }

    return {
        identifier: d.identifier || '',
        description: d.description || '',
        allowedIps,
        createdAt,
        lastUsedAt,
    };
};

export default (): Promise<ApiKey[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/account/api-keys')
            .then(({ data }) => {
                const list = (data && Array.isArray(data.data)) ? data.data : (Array.isArray(data) ? data : []);
                resolve((list || []).map((item: any) => rawDataToApiKey(item)));
            })
            .catch(reject);
    });
};
