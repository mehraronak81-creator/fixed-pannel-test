import http from '@/api/http';
import { ApiKey, rawDataToApiKey } from '@/api/account/getApiKeys';

export interface NewApiKey extends ApiKey {
    secretToken: string;
}

export default (description: string, allowedIps?: string): Promise<NewApiKey> => {
    return new Promise((resolve, reject) => {
        const ips = allowedIps
            ? allowedIps
                .split('\n')
                .map((ip) => ip.trim())
                .filter((ip) => ip.length > 0)
            : [];

        http.post('/api/client/account/api-keys', {
            description,
            allowed_ips: ips,
        })
            .then(({ data }) => {
                const key = rawDataToApiKey(data);
                const secretToken =
                    data?.meta?.secret_token ||
                    data?.meta?.secretToken ||
                    data?.attributes?.secret_token ||
                    data?.secret_token ||
                    '';
                resolve({
                    ...key,
                    secretToken,
                });
            })
            .catch(reject);
    });
};
