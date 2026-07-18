'use client'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Link from 'next/link'
import signOut from '@/server/actions/auth/handleSignOut'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import {
    PiUserDuotone,
    PiGearDuotone,
    PiPulseDuotone,
    PiSignOutDuotone, 
    PiShoppingCartThin
} from 'react-icons/pi'
import { IoIosLogOut } from "react-icons/io";


import { CiUser } from 'react-icons/ci'
import { FiBox, FiLock } from 'react-icons/fi'
import { LuPalette } from 'react-icons/lu'
import { IoNotificationsOutline } from 'react-icons/io5'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
const dropdownItemList = [
    // {
    //     label: 'Profile',
    //     path: '/concepts/account/settings',
    //     icon: <PiUserDuotone />,
    // },
    // {
    //     label: 'Account Setting',
    //     path: '/concepts/account/settings',
    //     icon: <PiGearDuotone />,
    // },
    // {
    //     label: 'Activity Log',
    //     path: '/concepts/account/activity-log',
    //     icon: <PiPulseDuotone />,
    // },
    {
        label: 'Personal Information',
        path: '/dashboards/profile/personal-information',
        icon: <CiUser />,
    },
    {
        label: 'Change Password',
        path: '/dashboards/profile/change-password',
        icon: <FiLock />,
    },
    {
        label: 'Simulation History',
        path: '/dashboards/profile/simulation-history',
        icon: <LuPalette />,
    },
    {
        label: 'Linked Order & Quotes',
        path: '/dashboards/profile/linked-order',
        icon: <FiBox />,
    },
    {
        label: 'Notification Setting',
        path: '/dashboards/profile/notification-setting',
        icon: <IoNotificationsOutline />,
    },
    {
        label: 'Design Result',
        path: '/dashboards/project',
        icon: "",
    },
    {
        label: 'Delivery Request Form',
        path: '/dashboards/delivery-request',
        icon: "",
    },

]

const _UserDropdown = () => {
    const router = useRouter()

    const { session } = useCurrentSession()
    const pathname = usePathname()

    const handleSignOut = async () => {
        await signOut()
    }

    const avatarProps = {
        ...(session?.user?.image
            ? { src: session?.user?.image }
            : { icon: <PiUserDuotone /> }),
    }

    const handleProfile = () => {
        router.push("/profile/my-profile");
    };
    return (
        <>
            {session?.user?.email && (
                <>
                    <div className="cursor-pointer flex items-center">
                        <Avatar size={38} {...avatarProps} onClick={handleProfile} />
                    </div>
                    <IoIosLogOut className='cursor-pointer z-10' size={25} onClick={handleSignOut} />
                </>
            )}
            {/* <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={38} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {session?.user?.name || 'Anonymous'}
                        </div>
                        <div className="text-xs">
                            {session?.user?.email || 'No email available'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => {
                const isActive = pathname === item.path

                return (
                    <Dropdown.Item
                        key={item.label}
                        eventKey={item.label}
                        className="px-0"
                    >
                        <Link
                            href={item.path}
                            className={`flex h-full w-full mx-3 pb-1 pt-3 items-center gap-2 border-b-1
                    ${isActive
                                    ? 'border-[#1C2C56]'
                                    : 'border-transparent'}
                `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    </Dropdown.Item>
                )
            })}

            <Dropdown.Item variant="divider" />
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item> 
        </Dropdown>*/}
        </>

    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
