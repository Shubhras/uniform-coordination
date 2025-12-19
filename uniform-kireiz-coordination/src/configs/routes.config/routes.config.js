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
    '/kireiz-form': {
        key: 'kireiz-form',
        authority: [],
    },
    '/medical-form': {
        key: 'medical-form',
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
    
}

export const authRoutes = authRoute
