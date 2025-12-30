'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import React from 'react'
import NavigationBar from '../../kireiz-form/components/NavigationBar'
import FaqHero from './FaqHero'
import FaqSection from './FaqSection'
import LandingFooter from '../../kireiz-form/components/LandingFooter'

const FaqHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }
    return (
        <main className=" text-base bg-white dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />
            <FaqHero />
            <FaqSection />
            <LandingFooter mode={mode} />
        </main>
    )
}

export default FaqHome