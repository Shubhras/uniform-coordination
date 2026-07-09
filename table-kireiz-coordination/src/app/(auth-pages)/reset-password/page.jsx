'use client'
import dynamic from 'next/dynamic'

const ResetPasswordClient = dynamic(
    () => import('./_components/ResetPasswordClient'),
    { ssr: false }
)

const Page = () => {
    return <ResetPasswordClient />
}

export default Page
