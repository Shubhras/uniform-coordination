'use client'

import { motion } from 'framer-motion'
import classNames from '@/utils/classNames'
import { useRouter, usePathname } from 'next/navigation'

/**
 * NavList Component
 * 
 * Navigation menu links component supporting animated active route tab highlight and mobile drawer layout variants.
 * 
 * @param {Object} props - Component props.
 * @param {Array} props.tabs - Array of navigation tab objects ({ title, url, ... }).
 * @param {string} props.tabClassName - Optional custom CSS class for tabs.
 * @param {Function} props.onTabClick - Optional callback invoked when a tab is clicked.
 * @param {string} props.variant - Display variant ('header' | 'drawer').
 */
const NavList = ({ tabs: propTabs, tabClassName, onTabClick, variant = 'header' }) => {
  const router = useRouter()
  const pathname = usePathname()

  /**
   * Redirects to target tab URL and triggers click callback.
   * 
   * @param {Object} tab - Target navigation tab item.
   */
  const handleRedirect = (tab) => {
    router.push(tab.url)
    onTabClick?.()
  }

  return (
    <div className={variant === 'drawer' ? 'flex flex-col gap-2' : 'flex'}>
      {propTabs.map((tab) => {
        const isActive = pathname === tab.url || pathname.startsWith(`${tab.url}/`)

        return (
          <button
            key={tab.title}
            onClick={() => handleRedirect(tab)}
            className={classNames(
              'relative px-4 py-2 rounded-xl font-medium transition-colors',
              variant === 'header'
                ? 'text-white'
                : 'text-[#1C2C56] w-full text-left rounded-lg hover:bg-[#1C2C56]/10',
              tabClassName
            )}
          >
            {isActive && variant === 'header' && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                className="absolute bottom-0 left-2 right-2 h-[2.9px] bg-[#A0522D] rounded-full"
              />
            )}

            <span className="relative z-10">{tab.title}</span>
          </button>
        )
      })}
    </div>
  )
}

export default NavList

