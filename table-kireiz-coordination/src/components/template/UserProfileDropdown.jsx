'use client'
import { useState, useEffect, useCallback } from 'react'
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
import { usePathname, useRouter } from 'next/navigation'
import { apiGetCartList } from '@/services/CartSummaryService'

const _UserDropdown = () => {
    const router = useRouter()
    const { session } = useCurrentSession()
    const pathname = usePathname()
    const [cartCount, setCartCount] = useState(0)

    const fetchCartCount = useCallback(async () => {
        if (!session?.accessToken) {
            setCartCount(0)
            return
        }
        try {
            const res = await apiGetCartList(session.accessToken, { page_size: 100 })
            if (res && Array.isArray(res.results)) {
                const totalQty = res.results.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)
                setCartCount(totalQty)
            } else if (res && res.count !== undefined) {
                setCartCount(res.count)
            } else {
                setCartCount(0)
            }
        } catch (err) {
            console.error('Failed to fetch cart item count:', err)
            setCartCount(0)
        }
    }, [session?.accessToken])

    useEffect(() => {
        fetchCartCount()

        const handleCartUpdated = () => {
            fetchCartCount()
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('cartUpdated', handleCartUpdated)
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('cartUpdated', handleCartUpdated)
            }
        }
    }, [fetchCartCount, pathname])

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
    const handleCartSummary = () => {
        router.push("/cart-summary");
    };

    return (
        <>
            {session?.user?.email && (
                <>
                    <div
                        className="relative cursor-pointer z-10 flex items-center justify-center p-1 group"
                        onClick={handleCartSummary}
                        title="View Cart"
                    >
                        <PiShoppingCartThin size={26} className="text-gray-800 group-hover:text-[#A0522D] transition-colors" />
                        <span className="absolute -top-1 -right-1.5 bg-[#A0522D] text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-white shadow-sm">
                            {cartCount}
                        </span>
                    </div>
                    <div className="cursor-pointer flex items-center">
                        <Avatar size={38} {...avatarProps} onClick={handleProfile} />
                    </div>
                    <IoIosLogOut className='cursor-pointer z-10' size={25} onClick={handleSignOut} />
                </>
            )}
        </>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
