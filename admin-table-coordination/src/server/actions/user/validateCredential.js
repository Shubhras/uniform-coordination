'use server'

const validateCredential = async (values) => {
    const { email, password } = values

    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        const response = await fetch(`${baseUrl}/api/v1/space/uniformAdmin/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()
        console.log("dataaaaaa",data)

        if (data.status && data.statusCode === 200) {
            // Extract permission slugs to keep session data light
            const permissions = []
            if (data.data.permissions && Array.isArray(data.data.permissions)) {
                data.data.permissions.forEach(perm => {
                    if (perm.slug) permissions.push(perm.slug)
                    if (perm.submenus && Array.isArray(perm.submenus)) {
                        perm.submenus.forEach(sub => {
                            if (sub.slug) permissions.push(sub.slug)
                        })
                    }
                })
            }

            const userRole = (data.data.user.role || '').toLowerCase()
            const isSuperAdmin = userRole === 'admin'
            const hasDashboard = permissions.some(p => {
                const norm = (p || '').toLowerCase().replace(/_and_|-|_/g, '')
                return norm === 'dashboard' || norm.includes('dashboard')
            })

            let entryPath = '/admin-form'
            if (!isSuperAdmin && !hasDashboard) {
                const slugMap = {
                    product_specification: '/products',
                    content_media: '/contents',
                    theme_management: '/theme-management',
                    inventory_management: '/inventory-management',
                    order_rentals: '/orders',
                    order_manage: '/orders',
                    saved_simulations: '/saved-simulations',
                    pricing_packages: '/pricing-packages',
                    payments: '/payments',
                    contracts_policies: '/contracts-policies',
                    notifications: '/notifications',
                    ai_automation: '/ai-automation',
                    user_permission: '/users-permissions',
                    simulation_assets: '/simulation-assets',
                    reports_analytics: '/reports-analytics',
                    system_settings: '/system-settings',
                }

                const firstPermWithRoute = (data.data.permissions || []).find(
                    p => p.route && p.route !== '/admin-form' && p.slug !== 'dashboard'
                )

                if (firstPermWithRoute?.route) {
                    entryPath = firstPermWithRoute.route
                } else {
                    for (const permSlug of permissions) {
                        const clean = (permSlug || '').toLowerCase().replace(/_and_|-/g, '_')
                        if (slugMap[clean]) {
                            entryPath = slugMap[clean]
                            break
                        }
                    }
                }
            }

            return {
                id: String(data.data.user.id),
                email: data.data.user.email,
                userName: data.data.user.name || data.data.user.email,
                avatar: '',
                authority: [data.data.user.role || 'admin'],
                role: data.data.user.role || 'admin',
                accessToken: data.data.access_token,
                refreshToken: data.data.refresh_token,
                permissions: permissions,
                entryPath: entryPath,
            }
        }

        return null
    } catch (error) {
        console.error('Login API error:', error)
        return null
    }
}

export default validateCredential
