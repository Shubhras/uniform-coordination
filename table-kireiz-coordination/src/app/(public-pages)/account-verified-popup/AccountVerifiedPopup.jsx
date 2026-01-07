'use client'

import Button from '@/components/ui/Button'
import Image from 'next/image'
import { HiBadgeCheck } from 'react-icons/hi'
import { useRouter } from 'next/navigation'

const AccountVerifiedPopup = ({ isOpen, onClose }) => {
    const router = useRouter()

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            // closable={false}
            className="w-full md:min-w-3xl mx-auto p-0"
        >

            {/* CARD */}
            <div className="bg-white rounded-xl px-10 py-12 text-center shadow-2xl w-full max-w-2xl">

                {/* LOGO + BRAND */}
                <div className="flex items-center gap-3 mb-8">
                    <Image
                        src="/img/logo/logo-table-footer.png"
                        alt="Kireiz Form"
                        width={60}
                        height={60}
                    />
                    {/* TITLE */}
                    <h2 className="text-xl font-semibold text-[#8a5a75]">
                        Welcome User!
                    </h2>
                </div>



                {/* VERIFIED MESSAGE */}
                <div className="mx-auto flex items-center justify-center text-[#8a5a75] text-2xl font-semibold text-center mb-10">
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

                    {/* <Button
                        variant="solid"
                        className="bg-[#C7D3E6] text-[#8a5a75] hover:bg-[#C7D3E6] px-8 w-full sm:w-auto"
                        onClick={() => router.push('/sign-in')}
                    >
                        Now you can login 
                    </Button> */}

                    <Button
                        variant="solid"
                        className="bg-[#8a5a75] text-white px-8 w-full sm:w-auto"
                        onClick={() => router.push('/sign-in')}
                    >
                        Now you can login
                    </Button>

                </div>
            </div>
        </Dialog >

    )
}

export default AccountVerifiedPopup
