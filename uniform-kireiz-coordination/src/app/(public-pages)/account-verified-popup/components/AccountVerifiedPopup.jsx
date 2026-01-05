'use client'

import Button from '@/components/ui/Button'
import Image from 'next/image'
import { HiBadgeCheck } from 'react-icons/hi'
import { useRouter } from 'next/navigation'

const AccountVerifiedPage = () => {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gray-300 flex items-center justify-center px-4">

            {/* CARD */}
            <div className="bg-white rounded-xl px-10 py-12 text-center shadow-2xl w-full max-w-2xl">

                {/* LOGO + BRAND */}
                <div className="flex items-center gap-3 mb-8">
                    <Image
                        src="/img/logo/uniform-nav-logo.png"
                        alt="Kireiz Form"
                        width={60}
                        height={60}
                    />
                    {/* TITLE */}
                    <h2 className="text-xl font-semibold text-[#012D53]">
                        Welcome User!
                    </h2>
                </div>



                {/* VERIFIED MESSAGE */}
                <div className="mx-auto flex items-center justify-center text-[#25455F] text-2xl font-semibold text-center mb-10">
                    <span>
                        Your account has been successfully{' '}
                        <span className="inline-flex items-center gap-1">
                            verified
                            <HiBadgeCheck size={28} />
                        </span>
                    </span>
                </div>


                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                    <Button
                        variant="solid"
                        className="bg-[#C7D3E6] text-[#1C2C56] hover:bg-[#C7D3E6] px-8 w-full sm:w-auto"
                        onClick={() => router.push('/dashboard')}
                    >
                        Go to Dashboard
                    </Button>

                    <Button
                        variant="solid"
                        className="bg-[#1C4ED8] hover:bg-[#1C4ED8] text-white px-8 w-full sm:w-auto"
                        onClick={() => router.push('/dashboards/uniform-3d-design')}
                    >
                        Start Designing Uniform
                    </Button>

                </div>
            </div>
        </div>
    )
}

export default AccountVerifiedPage
