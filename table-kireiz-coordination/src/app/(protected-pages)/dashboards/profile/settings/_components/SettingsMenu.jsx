'use client'
import Menu from '@/components/ui/Menu'
import ScrollBar from '@/components/ui/ScrollBar'
import { useSettingsStore } from '../_store/settingsStore'

import {
    TbUserSquare,
} from 'react-icons/tb'

import { useSearchParams } from 'next/navigation'
import { FiBox, FiLock } from 'react-icons/fi'
import { IoNotificationsOutline } from 'react-icons/io5'
import { LuPalette } from 'react-icons/lu'

const { MenuItem } = Menu

const menuList = [
    { label: 'Personal Information', value: 'personal-information', icon: <TbUserSquare /> },
    { label: 'Change Password', value: 'change-password', icon: <FiLock /> },
    { label: 'Simulation History', value: 'simulation-history', icon: <LuPalette /> },
    { label: 'Order History', value: 'order-history', icon: <FiBox /> },
    { label: 'Notifications', value: 'notifications', icon: <IoNotificationsOutline /> },
]

export const SettingsMenu = ({ onChange }) => {
    const searchParams = useSearchParams()

    const { currentView, setCurrentView } = useSettingsStore()

    const currentPath =
        searchParams.get('category') || searchParams.get('label') || 'inbox'

    const handleSelect = (value) => {
        setCurrentView(value)
        onChange?.()
    }

    return (
        <div className="flex flex-col justify-between h-full">
            <ScrollBar className="h-full overflow-y-auto">
                <Menu className="mx-2 mb-10">
                    {menuList.map((menu) => (
                        <MenuItem
                            key={menu.value}
                            eventKey={menu.value}
                            className={`mb-2 ${currentView === menu.value
                                ? 'border-b-2 border-[#A0522D]'
                                : ''
                                }`}
                            isActive={currentPath === menu.value}
                            onSelect={() => handleSelect(menu.value)}
                        >
                            <span className="text-2xl ltr:mr-2 rtl:ml-2 ">
                                {menu.icon}
                            </span>
                            <span>{menu.label}</span>
                        </MenuItem>
                    ))}
                </Menu>
            </ScrollBar>
        </div>
    )
}

export default SettingsMenu
