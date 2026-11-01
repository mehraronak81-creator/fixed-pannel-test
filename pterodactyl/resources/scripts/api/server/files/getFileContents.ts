import http from '@/api/http';

export default (uuid: string, file: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/files/contents`, {
            params: { file },
            transformResponse: (data) => data,
        })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
