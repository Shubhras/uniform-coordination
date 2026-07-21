'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import FooterPage from '../../footer/FooterPage'
import HaederPage from '../../header/HaederPage'
import ThemeDetails from './ThemeDetails'


import React, { Suspense } from 'react'

const ThemeDetailsHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <Suspense fallback={
                <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                    </div>
                </section>
            }>
                <ThemeDetails />
            </Suspense>
            <FooterPage mode={mode} />
        </main>
    )
}

export default ThemeDetailsHome
