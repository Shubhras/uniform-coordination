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

export const publicRoutes = {
    '/faq': {
        key: 'faq',
        authority: [],
    },
    '/blog': {
        key: 'blog',
        authority: [],
    },
    '/single-blog': {
        key: 'single-blog',
        authority: [],
    },
    '/table-form': {
        key: 'table-form',
        authority: [],
    },
    '/tbrowse-by-color': {
        key: 'browse-by-color',
        authority: [],
    },
    '/browse-by-theme': {
        key: 'browse-by-theme',
        authority: [],
    },
    '/dashboards/uniform-design': {
        key: 'dashboards/uniform-design',
        authority: [],
    },
    '/dashboards/uniform-single': {
        key: 'dashboards/uniform-single',
        authority: [],
    },
    '/dashboards/uniform-3d-design': {
        key: 'dashboards/uniform-3d-design',
        authority: [],
    },
    '/private-policy': {
        key: 'private-policy',
        authority: [],
    },
    '/terms-and-condition': {
        key: 'terms-and-condition',
        authority: [],
    },
     '/email-verification-page': {
        key: 'email-verification-page',
        authority: [],
    },
    '/account-verified-page': {
        key: 'account-verified-page',
        authority: [],
    },
     '/reset-password': {
        key: 'reset-password',
        authority: [],
    },

}

export const authRoutes = authRoute
