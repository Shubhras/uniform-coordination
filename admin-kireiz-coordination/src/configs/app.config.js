const appConfig = {
    apiPrefix: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
    authenticatedEntryPath: '/admin-form',
    unAuthenticatedEntryPath: '/sign-in',

    locale: 'en',
    activeNavTranslation: true,
}

export default appConfig
