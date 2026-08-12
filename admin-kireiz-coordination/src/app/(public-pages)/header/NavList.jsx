'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import classNames from '@/utils/classNames'
import { useRouter } from 'next/navigation'

const NavList = ({ tabs: propTabs, tabClassName, onTabClick, variant = 'header' }) => {
  const router = useRouter()
  const [active, setActive] = useState(propTabs[0])

  const handleRedirect = (tab) => {
    setActive(tab)
    router.push(tab.url)
    onTabClick?.()
  }

  return (
    <div className={variant === 'drawer' ? 'flex flex-col gap-2' : 'flex'}>
      {propTabs.map((tab) => (
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
          {active.value === tab.value && variant === 'header' && (
            <motion.div
              layoutId="clickedbutton"
              transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
              className="absolute inset-0 rounded-xl bg-white/10"
            />
          )}

          <span className="relative z-10">{tab.title}</span>
        </button>
      ))}
    </div>
  )
}

export default NavList
