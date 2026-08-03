'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import ThemeCards from './ThemeCards'
import BrowseByThemeHero from './BrowseByThemeHero'
import FooterPage from '../../footer/FooterPage'
import HaederPage from '../../header/HaederPage'

/**
 * BrowseByThemeHome Component
 * 
 * Main container component for the Browse By Theme section.
 * Manages theme mode state (Light/Dark) and integrates Header, Hero, Theme Cards, and Footer.
 */
const BrowseByThemeHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)

    /**
     * Toggles between Light and Dark mode themes.
     */
    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <BrowseByThemeHero />
            <ThemeCards />
            <FooterPage mode={mode} />
        </main>
    )
}

export default BrowseByThemeHome

