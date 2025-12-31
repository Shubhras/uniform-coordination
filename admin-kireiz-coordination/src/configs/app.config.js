const appConfig = {
    apiPrefix: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
    // authenticatedEntryPath: '/dashboards/ecommerce',
    authenticatedEntryPath: '/kireiz-form',
    unAuthenticatedEntryPath: '/sign-in',
    // unAuthenticatedEntryPath: '/auth/sign-in-split',
    
    locale: 'en',
    activeNavTranslation: true,
}

export default appConfig
