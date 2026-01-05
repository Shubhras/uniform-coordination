'use client'

import { lazy, Suspense } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import SettingsMenu from './SettingsMenu'
import SettingMobileMenu from './SettingMobileMenu'
import Loading from '@/components/shared/Loading'
import { useSettingsStore } from '../_store/settingsStore'

const MyProfile = lazy(() => import('./MyProfile'))
const PersonalInformation = lazy(() => import('./PersonalInformation'))
const ChangePassword = lazy(() => import('./ChangePassword'))
const SimulationHistory = lazy(() => import('./SimulationHistory'))
const OrderHistory = lazy(() => import('./LinkedOrderAndQuotes'))
const Notifications = lazy(() => import('./NotificationSetting'))

const Settings = () => {
    const { currentView } = useSettingsStore()

    return (
        <AdaptiveCard className="h-full mt-15">
            <div className="flex flex-auto h-full">
                <div className="w-[200px] xl:w-[280px] hidden lg:block ">
                    <SettingsMenu />
                </div>
                <div className="xl:ltr:pl-6 xl:rtl:pr-6 flex-1 py-2 ">
                    <div className="mb-6 lg:hidden ">
                        <SettingMobileMenu />
                    </div>
                    <Suspense
                        fallback={<Loading loading={true} className="w-full" />}
                    >
                        {currentView === 'my-profile' && <MyProfile />}
                        {currentView === 'personal-information' && <PersonalInformation />}
                        {currentView === 'change-password' && <ChangePassword />}
                        {currentView === 'simulation-history' && <SimulationHistory />}
                        {currentView === 'order-history' && <OrderHistory />}
                        {currentView === 'notifications' && <Notifications />}
                    </Suspense>
                </div>
            </div>
        </AdaptiveCard>
    )
}

export default Settings
