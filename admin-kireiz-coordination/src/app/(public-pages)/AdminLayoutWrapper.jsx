'use client'

import { useState } from 'react'
import AdminSidebar from './_components/AdminSidebar'
import AdminTopHeader from './_components/AdminTopHeader'
import MenuPermissionProvider from '@/components/shared/MenuPermissionProvider'
import MenuRouteGuard from '@/components/shared/MenuRouteGuard'

const AdminLayoutWrapper = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    return (
        <MenuPermissionProvider>
        <div className="min-h-screen bg-[#F8FAFC]">
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
                />
            </div>

            {/* Top Header */}
            <AdminTopHeader
                sidebarCollapsed={sidebarCollapsed}
                onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            />

            {/* Main Content */}
            <main
                className={`
                    pt-16 min-h-screen
                    transition-all duration-300 ease-in-out
                    ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[250px]'}
                    ml-0
                `}
            >
                <MenuRouteGuard>{children}</MenuRouteGuard>
            </main>
        </div>
        </MenuPermissionProvider>
    )
}

export default AdminLayoutWrapper
