'use client'
import HaederPage from '../header/HaederPage'
import FooterPage from '../footer/FooterPage'
import LayoutBase from '@/components/template/LayoutBase'
import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'

export default function DashboardPublicLayout({ children }) {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <LayoutBase className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <main className="flex-1 w-full bg-[#f8f9fa] py-8">
                {children}
            </main>
            <FooterPage mode={mode} />
        </LayoutBase>
    )
}
