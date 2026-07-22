'use client'
import { useState } from 'react'
import { FiMenu } from 'react-icons/fi'
import AdminSidebar from '@/app/(protected-pages)/_components/AdminSidebar'
import Header from '@/components/template/Header'
import Drawer from '@/components/ui/Drawer'
import LayoutBase from '@/components//template/LayoutBase'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'

const CollapsibleSide = ({ children }) => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    return (
        <LayoutBase
            type={LAYOUT_COLLAPSIBLE_SIDE}
            className="app-layout-collapsible-side flex flex-auto flex-col"
        >
            <div className="flex flex-auto min-w-0">
                <div className="hidden lg:block">
                    <AdminSidebar />
                </div>
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    <Header />
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="fixed left-2 top-16 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C2C56] text-white shadow-md transition-colors duration-200 hover:bg-[#22356A] lg:hidden"
                        aria-label="Open profile sidebar"
                    >
                        <FiMenu size={20} />
                    </button>
                    <Drawer
                        isOpen={mobileSidebarOpen}
                        onClose={() => setMobileSidebarOpen(false)}
                        onRequestClose={() => setMobileSidebarOpen(false)}
                        width={280}
                        placement="left"
                        bodyClass="p-0"
                    >
                        <AdminSidebar
                            collapsed={false}
                            isMobileOpen={mobileSidebarOpen}
                            onCloseMobile={() => setMobileSidebarOpen(false)}
                        />
                    </Drawer>
                    <div className="h-full flex flex-auto flex-col">
                        {children}
                    </div>
                </div>
            </div>
        </LayoutBase>
    )
}

export default CollapsibleSide
