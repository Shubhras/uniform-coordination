import React, { Suspense } from 'react'
import ChangePassword from './_components/ChangePassword'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'

const Page = () => {
    return (
        <>
            <AdaptiveCard className="bg-[#E8EEF8]/[0.12]">
                <div className="xl:ltr:pl-6 xl:rtl:pr-6 flex-1 py-2">
                    <Suspense
                        fallback={<Loading loading={true} className="w-full" />}
                    >
                        <ChangePassword />
                    </Suspense>
                </div>
                {/* </div> */}
            </AdaptiveCard>
        </>
    )
}

export default Page