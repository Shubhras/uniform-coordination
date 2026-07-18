'use client'
import {
    LAYOUT_COLLAPSIBLE_SIDE,
    LAYOUT_STACKED_SIDE,
    LAYOUT_TOP_BAR_CLASSIC,
    LAYOUT_FRAMELESS_SIDE,
    LAYOUT_CONTENT_OVERLAY,
    LAYOUT_BLANK,
} from '@/constants/theme.constant'
import FrameLessSide from './components/FrameLessSide'
import CollapsibleSide from './components/CollapsibleSide'
import StackedSide from './components/StackedSide'
import TopBarClassic from './components/TopBarClassic'
import ContentOverlay from './components/ContentOverlay'
import Blank from './components/Blank'
import PageContainer from '@/components/template/PageContainer'
import Footer from '@/components/template/Footer'
import queryRoute from '@/utils/queryRoute'
import useTheme from '@/utils/hooks/useTheme'
import { usePathname } from 'next/navigation'

const Layout = ({ children, layoutType }) => {
    switch (layoutType) {
        case LAYOUT_COLLAPSIBLE_SIDE:
            return <CollapsibleSide>{children}</CollapsibleSide>
        case LAYOUT_STACKED_SIDE:
            return <StackedSide>{children}</StackedSide>
        case LAYOUT_TOP_BAR_CLASSIC:
            return <TopBarClassic>{children}</TopBarClassic>
        case LAYOUT_FRAMELESS_SIDE:
            return <FrameLessSide>{children}</FrameLessSide>
        case LAYOUT_CONTENT_OVERLAY:
            return <ContentOverlay>{children}</ContentOverlay>
        case LAYOUT_BLANK:
            return <Blank>{children}</Blank>
        default:
            return <>{children}</>
    }
}

const PostLoginLayout = ({ children }) => {
    const layoutType = useTheme((state) => state.layout.type)

    const pathname = usePathname()

    const route = queryRoute(pathname)

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#FFF]">
            <Layout
                layoutType={route?.meta?.layout ? route?.meta?.layout : layoutType}
            >
                <PageContainer footer={false} {...route?.meta}>{children}</PageContainer>
            </Layout>
            <Footer className="w-full mt-auto" />
        </div>
    )
}

export default PostLoginLayout
