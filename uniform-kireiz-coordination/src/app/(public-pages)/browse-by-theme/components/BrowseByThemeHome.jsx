'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import BrowseBYThemeHero from './BrowseBYThemeHero'


import NavigationBar from '../../kireiz-form/components/NavigationBar'
import ThemeCards from './ThemeCards'
import LandingFooter from '../../kireiz-form/components/LandingFooter'


const BrowseByThemeHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="text-base bg-white dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />
            <BrowseBYThemeHero />
            <ThemeCards />
            <LandingFooter mode={mode} />
        </main>
    )
}

export default BrowseByThemeHome
