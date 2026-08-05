'use client'
import dynamic from 'next/dynamic'

// Dynamically import ResetPasswordClient with SSR disabled for search parameter access
const ResetPasswordClient = dynamic(
    () => import('./_components/ResetPasswordClient'),
    { ssr: false }
)

/**
 * Reset Password Page component.
 * Dynamically loads the client-side ResetPasswordClient view.
 *
 * @returns {JSX.Element} Reset password page container.
 */
const Page = () => {
    return <ResetPasswordClient />
}

export default Page
