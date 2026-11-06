'use client'

import React from 'react'
import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import HaederPage from '../../header/HaederPage'
import FooterPage from '../../footer/FooterPage'
import FavouritesList from './FavouritesList'

/**
 * FavouritesHome Component
 * 
 * Main container component for the Favorites page matching the Cart Summary layout.
 * Embeds application Header, FavouritesList, and Footer without a hero banner.
 */
const FavouritesHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="text-base bg-white dark:bg-gray-900 min-h-screen flex flex-col justify-between">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <FavouritesList />
            <FooterPage mode={mode} />
        </main>
    )
}

export default FavouritesHome
