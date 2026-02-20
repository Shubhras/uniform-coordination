import dashboardsRoute from './dashboardsRoute'
// import conceptsRoute from './conceptsRoute'
import uiComponentsRoute from './uiComponentsRoute'
import authRoute from './authRoute'
import authDemoRoute from './authDemoRoute'
// import guideRoute from './guideRoute'

export const protectedRoutes = {
    ...dashboardsRoute,
    ...uiComponentsRoute,
    ...authDemoRoute,
    // ...conceptsRoute,
    // ...guideRoute,
}

/**
 * Public routes — accessible WITHOUT login.
 * Everything NOT listed here (and not an auth route) requires authentication.
 */
export const publicRoutes = {
    '/private-policy': {
        key: 'private-policy',
        authority: [],
    },
    '/terms-and-condition': {
        key: 'terms-and-condition',
        authority: [],
    },
}

export const authRoutes = authRoute
