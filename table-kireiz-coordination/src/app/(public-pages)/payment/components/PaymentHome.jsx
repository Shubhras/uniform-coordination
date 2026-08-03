'use client'

import React from 'react'
import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import FooterPage from '../../footer/FooterPage'
import HaederPage from '../../header/HaederPage'
import PaymentHero from './PaymentHero'

/**
 * PaymentHome Component
 * 
 * Payment page layout assembling global header, payment gateway hero form, and footer with theme state.
 */
const PaymentHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)

    /**
     * Toggles between Light and Dark theme modes.
     */
    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <PaymentHero />
            <FooterPage mode={mode} />
        </main>
    )
}

export default PaymentHome