'use client'
import { motion } from 'framer-motion'
import classNames from '@/utils/classNames'
import { useRouter, usePathname } from 'next/navigation'

const NavList = ({ tabs: propTabs, tabClassName, onTabClick, variant = 'header' }) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleRedirect = (tab) => {
    router.push(tab.url)
    onTabClick?.()
  }

  return (
    <div className={variant === 'drawer' ? 'flex flex-col gap-2' : 'flex gap-5'}>
      {propTabs.map((tab) => {
        const isActive = pathname === tab.url || pathname.startsWith(`${tab.url}/`)
        
        return (
          <button
            key={tab.title}
            onClick={() => handleRedirect(tab)}
            className={classNames(
              'relative px-5 py-2 rounded-xl font-medium transition-colors',
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
                className="absolute inset-0 rounded-xl bg-white/10"
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


// 'use client'
// import { useState } from 'react'
// import { motion } from 'framer-motion'
// // eslint-disable-next-line import/named
// import { Link } from 'react-scroll'
// import NextLink from 'next/link'
// import classNames from '@/utils/classNames'
// import { useRouter } from 'next/navigation'
// const NavList = ({ tabs: propTabs, tabClassName, onTabClick }) => {
//     const router = useRouter()
//     const [active, setActive] = useState(propTabs[0])
//     const [show, setShow] = useState(false)

//     const moveSelectedTabToTop = (idx) => {
//         setShow(true)
//         const newTabs = [...propTabs]
//         const selectedTab = newTabs.splice(idx, 1)
//         newTabs.unshift(selectedTab[0])

//         setActive(newTabs[0])
//         onTabClick?.()
//     }
//     const handleRedirect = (tab) => {
//         setActive(tab)
//         router.push(tab.url)
//         onTabClick?.()
//     }


//     return (
//         <>
//             {/* {propTabs.map((tab, idx) => (
//                 <button
//                     key={tab.title}
//                     className={classNames(
//                         'relative px-4 py-2 rounded-xl',
//                         tabClassName,
//                     )}
//                     onClick={() => {
//                         moveSelectedTabToTop(idx)
//                     }}
//                     onMouseEnter={() => moveSelectedTabToTop(idx)}
//                     onMouseLeave={() => setShow(false)}
//                 >
//                     {active.value === tab.value && (
//                         <motion.div
//                             layoutId="clickedbutton"
//                             transition={{
//                                 type: 'spring',
//                                 bounce: 0.3,
//                                 duration: 0.6,
//                             }}
//                         />
//                     )}
//                     {}
//                     {tab.to ? (
//                         <Link
//                             smooth
//                             to={tab.to}
//                             className="relative block heading-text z-10 text-white"
//                             duration={500}
//                         >
//                             {tab.title}
//                         </Link>
//                     ) : (
//                         <NextLink
//                             href={tab.href}
//                             className="relative block heading-text z-10 text-white"
//                         >
//                             {tab.title}
//                         </NextLink>
//                     )}
//                 </button>
//             ))} */}
//             {propTabs.map((tab, idx) => (
//                 <button
//                     key={tab.title}
//                     className={classNames(
//                         'relative px-4 py-2 rounded-xl heading-text text-white',
//                         tabClassName
//                     )}
//                    onClick={() => handleRedirect(tab)}

//                 >
//                     {active.value === tab.value && (
//                         <motion.div
//                             layoutId="clickedbutton"
//                             transition={{
//                                 type: 'spring',
//                                 bounce: 0.3,
//                                 duration: 0.6,
//                             }}
//                             className="absolute inset-0 rounded-xl"
//                         />
//                     )}

//                     <span className="relative z-10">
//                         {tab.title}
//                     </span>
//                 </button>
//             ))}
//         </>
//     )
// }

// export default NavList
