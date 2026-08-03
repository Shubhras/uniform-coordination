'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import BrowseByColorHero from './BrowseByColorHero'
import BrowseCards from './BrowseCards'
import HaederPage from '../../header/HaederPage'
import FooterPage from '../../footer/FooterPage'

/**
 * BrowseByColorHome Component
 * 
 * Main container component for the Browse By Color section.
 * Manages theme toggling and embeds the Header, Hero, Product Filter Grid, and Footer.
 */
const BrowseByColorHome = () => {
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
            <BrowseByColorHero />
            <BrowseCards />
            <FooterPage mode={mode} />
        </main>
    )
}

export default BrowseByColorHome

