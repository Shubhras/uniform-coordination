'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import FooterPage from '../../footer/FooterPage'
import HaederPage from '../../header/HaederPage'
import CartSummary from './CartSummary'

/**
 * CartSummaryHome Component
 * 
 * Main container component for the shopping cart summary view.
 * Manages theme mode state (Light/Dark) and integrates Header, CartSummary, and Footer.
 */
const CartSummaryHome = () => {
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
            <CartSummary />
            <FooterPage mode={mode} />
        </main>
    )
}

export default CartSummaryHome

