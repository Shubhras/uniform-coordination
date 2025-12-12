'use client'

import HeroContent from './HeroContent'
import NavigationBar from './NavigationBar'
import Demos from './Demos'
import TechStack from './TechStack'
import OtherFeatures from './OtherFeatures'
import Components from './Components'
import LandingFooter from './LandingFooter'
import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import UniformBusinessEnquiry from './UniformBusinessEnquiry'

const UniformHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="px-4 lg:px-0 text-base bg-white dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />
            <HeroContent mode={mode} />
            {/* <div className="relative">
                <div
                    className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_5%,transparent_70%)] pointer-events-none select-none"
                ></div>
                <HeroContent mode={mode} />
            </div> */}
            <UniformBusinessEnquiry />
            <Demos mode={mode} />
            <TechStack />
            <OtherFeatures />
            <Components />
            <LandingFooter mode={mode} />
        </main>
    )
}

export default UniformHome
