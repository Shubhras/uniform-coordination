'use client'

import { useState } from 'react'
import { FiMenu } from 'react-icons/fi'
import AdminSidebar from './_components/AdminSidebar'
import LayoutBase from '@/components/template/LayoutBase'

const AdminLayoutWrapper = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center border-b border-[#E2E8F0] bg-white px-4 lg:hidden">
                <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1C2C56] transition-colors duration-200 hover:bg-[#F1F5F9]"
                    aria-label="Open sidebar"
                >
                    <FiMenu size={22} />
                </button>
            </div>

            {/* Mobile overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar — always visible on lg+, toggle on mobile */}
            <div className={`
                lg:block
                ${mobileSidebarOpen ? 'block' : 'hidden'}
            `}>
                <AdminSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    isFixed={true}
                    isMobileOpen={mobileSidebarOpen}
                    onCloseMobile={() => setMobileSidebarOpen(false)}
                />
            </div>
            <main
                className={`
                    pt-16 min-h-screen
                    transition-all duration-300 ease-in-out
                    ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[250px]'}
                    ml-0
                `}
            >
                <LayoutBase type="admin">
                    {children}
                </LayoutBase>
            </main>
        </div>
    )
}

export default AdminLayoutWrapper
