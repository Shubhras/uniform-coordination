'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import signOut from '@/server/actions/auth/handleSignOut'
import NotificationPopup from './NotificationPopup'
import {
    FiBell,
    FiGlobe,
    FiChevronDown,
    FiUser,
    FiSettings,
    FiLogOut,
    FiMenu,
} from 'react-icons/fi'

const AdminTopHeader = ({ sidebarCollapsed, onMobileMenuToggle }) => {
    const { session } = useCurrentSession()
    const router = useRouter()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const dropdownRef = useRef(null)
    const notifRef = useRef(null)

    // Close dropdown & notification popup on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        setDropdownOpen(false)
        await signOut()
    }

    const userName = session?.user?.name || 'Admin'
    const userEmail = session?.user?.email || ''

    return (
        <header
            className={`
                fixed top-0 right-0 z-30 h-16
                bg-white border-b border-[#E2E8F0]
                flex items-center justify-between
                px-4 md:px-6
                transition-all duration-300 ease-in-out
                left-0
                ${sidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-[250px]'}
            `}
        >
            {/* Left: Mobile hamburger */}
            <button
                onClick={onMobileMenuToggle}
                className="lg:hidden text-[#64748B] hover:text-[#1C2C56] p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                aria-label="Open menu"
            >
                <FiMenu size={22} />
            </button>

            {/* Spacer for desktop */}
            <div className="hidden lg:block" />

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 md:gap-5">

                {/* Language Selector */}
                {/* <button className="flex items-center gap-1.5 text-[#64748B] hover:text-[#1C2C56] transition-colors">
                    <FiGlobe size={18} />
                    <span className="text-sm font-medium hidden sm:inline">EN</span>
                </button> */}

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => {
                            setNotifOpen(!notifOpen)
                            setDropdownOpen(false)
                        }}
                        className={`relative text-[#64748B] hover:text-[#1C2C56] transition-colors p-2 rounded-full hover:bg-[#F1F5F9] ${notifOpen ? 'bg-[#F1F5F9] text-[#1C2C56]' : ''
                            }`}
                    >
                        <FiBell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    </button>

                    {/* Notification Popup */}
                    {notifOpen && (
                        <NotificationPopup onClose={() => setNotifOpen(false)} />
                    )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => {
                            setDropdownOpen(!dropdownOpen)
                            setNotifOpen(false)
                        }}
                        className="flex items-center gap-2 md:gap-3 hover:bg-[#F8FAFC] rounded-lg px-2 py-1.5 transition-colors"
                    >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-[#1C2C56] flex items-center justify-center overflow-hidden">
                            {session?.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    width={36}
                                    height={36}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FiUser className="text-white" size={18} />
                            )}
                        </div>

                        {/* Name */}
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold text-[#1E293B] leading-tight">{userName}</p>
                        </div>

                        <FiChevronDown
                            size={16}
                            className={`hidden md:block text-[#94A3B8] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-2 z-50">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-[#F1F5F9]">
                                <p className="text-sm font-semibold text-[#1E293B]">{userName}</p>
                                {userEmail && (
                                    <p className="text-xs text-[#94A3B8] mt-0.5 truncate">{userEmail}</p>
                                )}
                            </div>

                            {/* Menu Items */}
                            {/* <div className="py-1">
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false)
                                        router.push('/dashboards/profile/settings')
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1C2C56] transition-colors"
                                >
                                    <FiUser size={16} />
                                    <span>My Profile</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false)
                                        router.push('/dashboards/profile/settings')
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1C2C56] transition-colors"
                                >
                                    <FiSettings size={16} />
                                    <span>Settings</span>
                                </button>
                            </div> */}

                            {/* Sign Out */}
                            <div className="border-t border-[#F1F5F9] pt-1">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <FiLogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default AdminTopHeader
