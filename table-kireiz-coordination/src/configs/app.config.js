const getApiBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        // When in browser on a remote host (e.g. sslip.io or domain), ensure we never point to localhost
        if (host !== 'localhost' && host !== '127.0.0.1') {
            if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
                return window.location.origin;
            }
        }
    }
    return envUrl || 'http://table.172.237.71.124.sslip.io';
};

const appConfig = {
    get apiPrefix() {
        return `${getApiBaseUrl()}/api`;
    },
    authenticatedEntryPath: '/table-form',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'en',
    activeNavTranslation: true,
}

export default appConfig
