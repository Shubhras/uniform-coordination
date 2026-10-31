'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import SideNav from '@/components/template/SideNav'
import AdminSidebar from '@/app/(protected-pages)/_components/AdminSidebar'
import Header from '@/components/template/Header'
import SideNavToggle from '@/components/template/SideNavToggle'
import MobileNav from '@/components/template/MobileNav'
import Search from '@/components/template/Search'
import LanguageSelector from '@/components/template/LanguageSelector'
import Notification from '@/components/template/Notification'
import UserProfileDropdown from '@/components//template/UserProfileDropdown'
import SidePanel from '@/components//template/SidePanel'
import LayoutBase from '@/components//template/LayoutBase'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import { FiSidebar } from 'react-icons/fi'

const routeTitles = {
    '/profile/my-profile': 'My Profile',
    '/profile/personal-information': 'Personal Information',
    '/profile/change-password': 'Change Password',
    '/profile/simulation-history': 'Simulation History',
    '/profile/my-order-rentals': 'My Orders & Rentals',
    '/profile/notifications': 'Notifications',
    '/profile/my-quotations': 'My Quotations',
    '/profile/order-history': 'Order History',
}

const CollapsibleSide = ({ children }) => {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const currentTitle = routeTitles[pathname] || 'Profile Menu'

    return (
        <LayoutBase
            type={LAYOUT_COLLAPSIBLE_SIDE}
            className="app-layout-collapsible-side flex flex-auto flex-col"
        >
            <div className="flex flex-auto min-w-0">
                {/* AdminSidebar: Desktop inline + Mobile drawer */}
                <AdminSidebar
                    mobileOpen={mobileOpen}
                    onCloseMobile={() => setMobileOpen(false)}
                />

                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full lg:pt-14">
                    <Header
                        className="shadow-sm dark:shadow-2xl"
                        headerStart={
                            <>
                                <MobileNav />
                                <SideNavToggle />
                                <Search />
                            </>
                        }
                        headerEnd={
                            <>
                                <LanguageSelector />
                                <Notification />
                                <SidePanel />
                                <UserProfileDropdown hoverable={false} />
                            </>
                        }
                    />

                    {/* Mobile Profile Navigation Bar (sticky below fixed header on < lg screens) */}
                    <div className="lg:hidden sticky top-14 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between shadow-2xs mt-14">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FBF4F3] hover:bg-[#F3E7E4] text-[#A85A32] text-sm font-semibold border border-[#E8B4A9]/50 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                            aria-label="Open Profile Menu"
                        >
                            <FiSidebar size={18} className="text-[#A85A32]" />
                            <span>Profile Menu</span>
                        </button>
                        <span className="text-xs font-semibold text-gray-500 capitalize truncate max-w-[170px]">
                            {currentTitle}
                        </span>
                    </div>

                    <div className="h-full flex flex-auto flex-col">
                        {children}
                    </div>
                </div>
            </div>
        </LayoutBase>
    )
}

export default CollapsibleSide

