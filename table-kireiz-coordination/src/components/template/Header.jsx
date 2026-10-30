// import classNames from '@/utils/classNames'
// import { HEADER_HEIGHT } from '@/constants/theme.constant'

// const Header = (props) => {
//     const {
//         headerStart,
//         headerEnd,
//         headerMiddle,
//         className,
//         container,
//         wrapperClass,
//     } = props

//     return (
//         <header className={classNames('header', className)}>
//             <div
//                 className={classNames(
//                     'header-wrapper',
//                     container && 'container mx-auto',
//                     wrapperClass,
//                 )}
//                 style={{ height: HEADER_HEIGHT }}
//             >
//                 <div className="header-action header-action-start">
//                     {headerStart}
//                 </div>
//                 {headerMiddle && (
//                     <div className="header-action header-action-middle">
//                         {headerMiddle}
//                     </div>
//                 )}
//                 <div className="header-action header-action-end">
//                     {headerEnd}
//                 </div>
//             </div>
//         </header>
//     )
// }

// export default Header

import classNames from '@/utils/classNames'
import { HEADER_HEIGHT } from '@/constants/theme.constant'
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import Image from "next/image";
import Link from "next/link";
import { TbMenu2 } from "react-icons/tb";
import { FiSidebar } from "react-icons/fi";
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import NavList from '@/app/(public-pages)/header/NavList';
import NavOtherList from '@/app/(public-pages)/header/NavOtherList';
import AuthButtons from '@/app/(public-pages)/header/AuthButtons';
import { IoClose } from 'react-icons/io5';
import { useRouter, usePathname } from 'next/navigation';
const navMenu = [
    { title: "Home", value: "home", to: "home", url: "/table-form" },
    //   { title: "Table Design", value: "tableDesign", to: "tableDesign", url: "/" },
    { title: "Browse by Color", value: "browseByColor", to: "browseByColor", url: "/browse-by-color" },
    { title: "Browse by Theme", value: "browseByTheme", to: "browseByTheme", url: "/browse-by-theme" },
    { title: "Canvas", value: "canvas", to: "canvas", url: "/dashboards/uniform-3d-design" },

    //   { title: "Faq", value: "faq", to: "faq", url: "/faq" },
    //   { title: "Blog", value: "blog", to: "blog", url: "/blog" },
];
const Header = ({ toggleMode, mode }) => {
    const { session } = useCurrentSession();
    const [isOpen, setIsOpen] = useState(false);
    const [activeLoginUser, setActiveLoginUser] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    return (
        <header className="fixed inset-x-0 top-0 z-50 bg-[#E8B4A9]">
            <div className="mx-auto px-5 md:px-8 lg:px-12">
                <div className="flex h-14 items-center justify-between">

                    {/* LEFT: Hamburger + Logo + Profile Quick Trigger */}
                    <div className="flex items-center gap-3">
                        {/* Hamburger (sm & md only) -> Site Navigation */}
                        <button
                            className="lg:hidden text-white text-2xl transition-transform duration-200"
                            onClick={() => setIsOpen((prev) => !prev)}
                            aria-label="Toggle navigation"
                        >
                            {isOpen ? <IoClose /> : <TbMenu2 />}
                        </button>

                        {/* Logo */}
                        <Image
                            src="/img/logo/logo-table-footer.png"
                            width={70}
                            height={40}
                            alt="logo"
                            priority
                            onClick={() => router.push("/table-form")}
                            className="cursor-pointer"
                        />

                        {/* Profile Sidebar Quick Toggle (sm & md only, on profile pages) */}
                        {/* {pathname?.startsWith('/profile') && (
                            <button
                                type="button"
                                className="lg:hidden flex items-center gap-1.5 text-white bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                                onClick={() => window.dispatchEvent(new CustomEvent('openProfileSidebar'))}
                                title="Open Profile Menu"
                                aria-label="Open profile menu"
                            >
                                <FiSidebar size={16} />
                                <span className="hidden xs:inline">Profile</span>
                            </button>
                        )} */}
                    </div>

                    {/* CENTER: Desktop Nav */}
                    <nav className="hidden lg:flex flex-1 justify-center text-sm font-medium text-white">
                        <NavList tabs={navMenu} />
                    </nav>

                    {/* RIGHT: Auth or Profile (ALL screens) */}
                    <div className="flex items-center gap-4 text-white">
                        {!session?.user?.email && <AuthButtons />}
                        {session?.user?.email && <NavOtherList />}
                    </div>
                </div>
            </div>

            {/* Drawer: Navigation only */}
            <Drawer
                title="Navigation"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onRequestClose={() => setIsOpen(false)}
                width={260}
                placement="left"
            >
                <NavList
                    tabs={navMenu}
                    variant="drawer"
                    onTabClick={() => setIsOpen(false)}
                />
            </Drawer>

        </header>
    )
}

export default Header

