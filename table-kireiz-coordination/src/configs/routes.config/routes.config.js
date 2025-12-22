import dashboardsRoute from './dashboardsRoute'
import conceptsRoute from './conceptsRoute'
import uiComponentsRoute from './uiComponentsRoute'
import authRoute from './authRoute'
import authDemoRoute from './authDemoRoute'
import guideRoute from './guideRoute'

export const protectedRoutes = {
    ...dashboardsRoute,
    ...uiComponentsRoute,
    ...authDemoRoute,
    ...conceptsRoute,
    ...guideRoute,
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
    '/kireiz-form': {
        key: 'kireiz-form',
        authority: [],
    },
    '/medical-form': {
        key: 'medical-form',
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

}

export const authRoutes = authRoute
