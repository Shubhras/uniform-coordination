import React, { Suspense } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import NotificationSetting from './_components/NotificationSetting'

const Page = () => {
    return (
        <>
            <AdaptiveCard className="bg-[#E8EEF8]/[0.12] mt-15">
                <div className="xl:ltr:pl-6 xl:rtl:pr-6 flex-1 py-2">
                    <Suspense
                        fallback={<Loading loading={true} className="w-full" />}
                    >
                        <NotificationSetting />
                    </Suspense>
                </div>
                {/* </div> */}
            </AdaptiveCard>
        </>
    )
}

export default Page