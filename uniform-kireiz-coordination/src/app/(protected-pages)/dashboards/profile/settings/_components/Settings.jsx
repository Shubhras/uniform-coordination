'use client'

import { lazy, Suspense } from 'react'
import React, { useRef, useState,useEffect } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import SettingsMenu from './SettingsMenu'
import SettingMobileMenu from './SettingMobileMenu'
import Loading from '@/components/shared/Loading'
import { useSettingsStore } from '../_store/settingsStore'
import { apiGetProfile } from '@/services/AuthProfileService'
import { useSession } from 'next-auth/react'
const MyProfile = lazy(() => import('./MyProfile'))
const PersonalInformation = lazy(() => import('./PersonalInformation'))
const ChangePassword = lazy(() => import('./ChangePassword'))
const SimulationHistory = lazy(() => import('./SimulationHistory'))
const OrderHistory = lazy(() => import('./LinkedOrderAndQuotes'))
const Notifications = lazy(() => import('./NotificationSetting'))

const Settings = () => {
    
    const { currentView } = useSettingsStore()
    const { data: session } = useSession()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        if (!session?.accessToken) return

        const fetchProfile = async () => {
            try {
                const res = await apiGetProfile(session.accessToken)
                setProfile(res.data)
            } catch (error) {
                console.error('Profile API error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [session?.accessToken])
    return (
        <AdaptiveCard className="h-full mt-15">
            <div className="flex flex-auto h-full">
                <div className="max-w-xs w-full hidden lg:block ">
                    <SettingsMenu />
                </div>
                <div className="flex-1 py-2 ">
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
