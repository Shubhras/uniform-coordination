'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import useTheme from '@/utils/hooks/useTheme'
import { apiGetUserNotifications } from '@/services/AuthProfileService'
import {
    FiGrid,
    FiUser,
    FiInfo,
    FiLock,
    FiClock,
    FiBox,
    FiBell,
    FiFileText,
    FiChevronRight,
    FiChevronLeft,
} from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'

const sidebarMenu = [
    {
        label: 'My Profile',
        icon: FiUser,
        path: '/profile/my-profile',
        slug: "profile",
    },
    {
        label: 'Personal Information',
        icon: FiInfo,
        path: '/profile/personal-information',
        slug: "profile",
    },
    {
        label: 'Change Password',
        icon: FiLock,
        path: '/profile/change-password',
        slug: "profile",
    },
    {
        label: 'Simulation History',
        icon: FiClock,
        path: '/profile/simulation-history',
        slug: "profile",
    },
    {
        label: 'My Order & Rentals',
        icon: FiFileText,
        path: '/profile/my-order-rentals',
        slug: "profile",
    },
    {
        label: 'Notifications',
        icon: FiBell,
        path: '/profile/notifications',
        slug: "profile",
    },
]

const AdminSidebar = ({
    collapsed: propCollapsed,
    onToggle,
    isFixed = false,
    mobileOpen: propMobileOpen,
    onCloseMobile,
}) => {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = useSession()
    const [unreadCount, setUnreadCount] = useState(0)
    const [internalMobileOpen, setInternalMobileOpen] = useState(false)
    const userPermissions = session?.user?.permissions || []

    const themeSideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)
    const setSideNavCollapse = useTheme((state) => state.setSideNavCollapse)

    const collapsed = propCollapsed !== undefined ? propCollapsed : themeSideNavCollapse
    const isMobileOpen = propMobileOpen !== undefined ? propMobileOpen : internalMobileOpen

    const handleCloseMobile = () => {
        if (onCloseMobile) {
            onCloseMobile()
        }
        setInternalMobileOpen(false)
    }

    // Auto-close mobile drawer when navigating
    useEffect(() => {
        handleCloseMobile()
    }, [pathname])

    // Global event listeners to open/close/toggle profile sidebar from anywhere
    useEffect(() => {
        const handleOpen = () => setInternalMobileOpen(true)
        const handleClose = () => setInternalMobileOpen(false)
        const handleToggle = () => setInternalMobileOpen((prev) => !prev)

        if (typeof window !== 'undefined') {
            window.addEventListener('openProfileSidebar', handleOpen)
            window.addEventListener('closeProfileSidebar', handleClose)
            window.addEventListener('toggleProfileSidebar', handleToggle)
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('openProfileSidebar', handleOpen)
                window.removeEventListener('closeProfileSidebar', handleClose)
                window.removeEventListener('toggleProfileSidebar', handleToggle)
            }
        }
    }, [])

    useEffect(() => {
        let isMounted = true
        const fetchUnreadCount = async () => {
            if (session?.user?.accessToken) {
                try {
                    const res = await apiGetUserNotifications(session.user.accessToken)
                    if (isMounted) {
                        if (res?.unread_count !== undefined) {
                            setUnreadCount(res.unread_count)
                        } else if (Array.isArray(res?.data)) {
                            const unread = res.data.filter((item) => !item.is_read).length
                            setUnreadCount(unread)
                        } else {
                            setUnreadCount(0)
                        }
                    }
                } catch (err) {
                    if (isMounted) setUnreadCount(0)
                }
            } else {
                if (isMounted) setUnreadCount(0)
            }
        }

        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 15000)

        const handleNotificationsUpdated = () => {
            fetchUnreadCount()
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('notificationsUpdated', handleNotificationsUpdated)
        }

        return () => {
            isMounted = false
            clearInterval(interval)
            if (typeof window !== 'undefined') {
                window.removeEventListener('notificationsUpdated', handleNotificationsUpdated)
            }
        }
    }, [session?.user?.accessToken, pathname])

    const handleToggle = () => {
        if (onToggle) {
            onToggle()
        } else {
            setSideNavCollapse(!themeSideNavCollapse)
        }
    }

    const isActive = (path) => {
        if (path === '/admin-form') {
            return pathname === '/admin-form' || pathname === '/kireiz-form'
        }
        return pathname.startsWith(path)
    }

    return (
        <>
            {/* Desktop Sidebar: hidden on mobile (< lg), flex on desktop (>= lg) */}
            <aside
                className={`
                    hidden lg:flex flex-col
                    ${isFixed ? 'fixed top-0 left-0 z-40 h-screen' : 'relative h-auto min-h-screen z-20 flex-shrink-0'}
                    bg-white border-r border-[#E2E8F0]
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-[72px]' : 'w-[250px]'}
                `}
            >
                {/* Logo + Collapse Toggle */}
                <div className="flex items-center justify-between h-14 px-4 border-b border-[#E2E8F0]">
                    {!collapsed && (
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => router.push('/admin-form')}
                        >
                            <Image
                                src="/img/others/auth-logo.png"
                                width={120}
                                height={36}
                                alt="Kireiz Logo"
                                priority
                                className="object-contain"
                            />
                        </div>
                    )}
                    {collapsed && (
                        <div
                            className="flex items-center justify-center w-full cursor-pointer"
                            onClick={() => router.push('/admin-form')}
                        >
                            <Image
                                src="/img/others/auth-logo-small.png"
                                width={30}
                                height={30}
                                alt="Kireiz Logo"
                                priority
                                className="object-contain"
                            />
                        </div>
                    )}
                    <button
                        onClick={handleToggle}
                        className={`
                            flex items-center justify-center
                            w-7 h-7 rounded-full
                            bg-[#F1F5F9] hover:bg-[#E2E8F0]
                            text-[#64748B] hover:text-[#1C2C56]
                            transition-colors duration-200 cursor-pointer
                            ${collapsed ? 'absolute -right-3.5 top-5 bg-white border border-[#E2E8F0] shadow-sm' : ''}
                        `}
                        aria-label="Toggle sidebar"
                    >
                        {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
                    <ul className="space-y-1">
                        {sidebarMenu.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.path)
                            const isNotification = item.path === '/profile/notifications'

                            return (
                                <li key={item.path}>
                                    <button
                                        onClick={() => router.push(item.path)}
                                        title={collapsed ? item.label : undefined}
                                        className={`
                                            group relative flex items-center gap-3 w-full
                                            rounded-lg text-sm font-medium
                                            transition-all duration-200 cursor-pointer
                                            ${collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5'}
                                            ${active
                                                ? 'text-[#A85A32] bg-transparent shadow-none'
                                                : 'text-[#1C2C56] hover:bg-[#F1F5F9] hover:text-[#1C2C56]'
                                            }
                                        `}
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <Icon
                                                size={20}
                                                className={`flex-shrink-0 transition-colors duration-200
                                                    ${active ? 'text-[#A85A32]' : 'text-[#1C2C56] group-hover:text-[#1C2C56]'}
                                                `}
                                            />
                                            {isNotification && unreadCount > 0 && (
                                                <span className="absolute -top-1.5 -right-1 bg-[#B66636] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-white shadow-sm leading-none">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        {!collapsed && (
                                            <span className={`truncate leading-snug ${active ? 'border-b-[1.5px] border-[#A85A32] pb-[2px]' : ''}`}>
                                                {item.label}
                                            </span>
                                        )}

                                        {/* Tooltip on collapsed */}
                                        {collapsed && (
                                            <div className="
                                                absolute left-full ml-3 px-3 py-1.5
                                                bg-[#1C2C56] text-white text-xs font-medium
                                                rounded-md whitespace-nowrap
                                                opacity-0 invisible
                                                group-hover:opacity-100 group-hover:visible
                                                transition-all duration-200
                                                pointer-events-none z-50
                                                shadow-lg
                                            ">
                                                {item.label} {isNotification && unreadCount > 0 ? `(${unreadCount})` : ''}
                                                <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-[#1C2C56] rotate-45" />
                                            </div>
                                        )}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Mobile Drawer Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 lg:hidden transition-opacity duration-300"
                    onClick={handleCloseMobile}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Slide-over Drawer */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-[270px] max-w-[85vw]
                    bg-white shadow-2xl flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    lg:hidden
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between h-14 px-4 border-b border-[#E2E8F0] bg-[#FBF4F3]">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                            handleCloseMobile()
                            router.push('/profile/my-profile')
                        }}
                    >
                        <Image
                            src="/img/others/auth-logo.png"
                            width={110}
                            height={32}
                            alt="Kireiz Logo"
                            priority
                            className="object-contain"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleCloseMobile}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 transition-colors cursor-pointer"
                        aria-label="Close sidebar"
                    >
                        <IoClose size={22} />
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
                    <ul className="space-y-1">
                        {sidebarMenu.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.path)
                            const isNotification = item.path === '/profile/notifications'

                            return (
                                <li key={item.path}>
                                    <button
                                        onClick={() => {
                                            handleCloseMobile()
                                            router.push(item.path)
                                        }}
                                        className={`
                                            group relative flex items-center gap-3 w-full
                                            rounded-lg text-sm font-medium px-3 py-3
                                            transition-all duration-200 cursor-pointer
                                            ${active
                                                ? 'text-[#A85A32] bg-[#FBF4F3] font-semibold'
                                                : 'text-[#1C2C56] hover:bg-[#F1F5F9] hover:text-[#1C2C56]'
                                            }
                                        `}
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <Icon
                                                size={20}
                                                className={`flex-shrink-0 transition-colors duration-200
                                                    ${active ? 'text-[#A85A32]' : 'text-[#1C2C56] group-hover:text-[#1C2C56]'}
                                                `}
                                            />
                                            {isNotification && unreadCount > 0 && (
                                                <span className="absolute -top-1.5 -right-1 bg-[#B66636] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-white shadow-sm leading-none">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        <span className="truncate leading-snug">
                                            {item.label}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    )
}

export default AdminSidebar
