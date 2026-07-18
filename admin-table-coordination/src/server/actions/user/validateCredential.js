'use server'

const validateCredential = async (values) => {
    const { email, password } = values

    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        const response = await fetch(`${baseUrl}/api/v1/uniformAdmin/login/`, {
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

            return {
                id: String(data.data.user.id),
                email: data.data.user.email,
                userName: data.data.user.name || data.data.user.email,
                avatar: '',
                authority: [data.data.user.role || 'admin'],
                accessToken: data.data.access_token,
                refreshToken: data.data.refresh_token,
                permissions: permissions,
            }
        }

        return null
    } catch (error) {
        console.error('Login API error:', error)
        return null
    }
}

export default validateCredential
