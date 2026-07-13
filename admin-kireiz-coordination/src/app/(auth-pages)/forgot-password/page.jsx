'use client'
import dynamic from 'next/dynamic'

const ForgotPasswordClient = dynamic(
    () => import('./_components/ForgotPasswordClient'),
    { ssr: false }
)

const Page = () => {
    return <ForgotPasswordClient />
}

export default Page
