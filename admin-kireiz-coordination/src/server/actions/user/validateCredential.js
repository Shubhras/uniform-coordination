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

        if (data.status && data.statusCode === 200) {
            return {
                id: String(data.data.user.id),
                email: data.data.user.email,
                userName: data.data.user.name || data.data.user.email,
                avatar: '',
                authority: [data.data.user.role || 'admin'],
                accessToken: data.data.access_token,
                refreshToken: data.data.refresh_token,
            }
        }

        return null
    } catch (error) {
        console.error('Login API error:', error)
        return null
    }
}

export default validateCredential
