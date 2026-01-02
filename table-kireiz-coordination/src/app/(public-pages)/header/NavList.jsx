'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
// eslint-disable-next-line import/named
import { Link } from 'react-scroll'
import NextLink from 'next/link'
import classNames from '@/utils/classNames'
import { useRouter } from 'next/navigation'
const NavList = ({ tabs: propTabs, tabClassName, onTabClick }) => {
    const router = useRouter()
    const [active, setActive] = useState(propTabs[0])
    const [show, setShow] = useState(false)

    const moveSelectedTabToTop = (idx) => {
        setShow(true)
        const newTabs = [...propTabs]
        const selectedTab = newTabs.splice(idx, 1)
        newTabs.unshift(selectedTab[0])
border
        setActive(newTabs[0])
        onTabClick?.()
    }
    const handleRedirect = (tab) => {
        router.push(tab.url)
    }
    return (
        <>
            {/* {propTabs.map((tab, idx) => (
                <button
                    key={tab.title}
                    className={classNames(
                        'relative px-4 py-2 rounded-xl',
                        tabClassName,
                    )}
                    onClick={() => {
                        moveSelectedTabToTop(idx)
                    }}
                    onMouseEnter={() => moveSelectedTabToTop(idx)}
                    onMouseLeave={() => setShow(false)}
                >
                    {active.value === tab.value && (
                        <motion.div
                            layoutId="clickedbutton"
                            transition={{
                                type: 'spring',
                                bounce: 0.3,
                                duration: 0.6,
                            }}
                        />
                    )}
                    {}
                    {tab.to ? (
                        <Link
                            smooth
                            to={tab.to}
                            className="relative block heading-text z-10 text-white"
                            duration={500}
                        >
                            {tab.title}
                        </Link>
                    ) : (
                        <NextLink
                            href={tab.href}
                            className="relative block heading-text z-10 text-white"
                        >
                            {tab.title}
                        </NextLink>
                    )}
                </button>
            ))} */}
            {propTabs.map((tab, idx) => (
                <button
                    key={tab.title}
                    className={classNames(
                        'relative px-4 py-2 heading-text text-white ',
                        tabClassName
                    )}
                    onClick={() => handleRedirect(tab, idx)}
                >
                    {active.value === tab.value && (
                        <motion.div
                            layoutId="clickedbutton"
                            transition={{
                                type: 'spring',
                                bounce: 0.3,
                                duration: 0.6,
                            }}
                            className="absolute inset-0 "
                        />
                    )}

                    <span className="relative z-10 ">
                        {tab.title}
                    </span>
                </button>
            ))}
        </>
    )
}

export default NavList
