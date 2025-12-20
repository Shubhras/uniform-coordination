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
import NavList from '@/app/(public-pages)/kireiz-form/components/NavList';
import AuthButtons from '@/app/(public-pages)/kireiz-form/components/AuthButtons';
import NavOtherList from '@/app/(public-pages)/kireiz-form/components/NavOtherList';
import useCurrentSession from '@/utils/hooks/useCurrentSession'
const navMenu = [
    { title: "Home", value: "home", to: "home", url: "/kireiz-form" },
    { title: "Uniform Design", value: "uniformDesign", to: "uniformDesign", url: "/dashboards/uniform-3d-design" },
    { title: "Blog", value: "blog", to: "blog", url: "/kireiz-form" },
    { title: `FAQ's`, value: "faq", href: "/guide/documentation/introduction", url: "/kireiz-form" },
];
const Header = ({ toggleMode, mode }) => {
      const { session } = useCurrentSession();
    const [isOpen, setIsOpen] = useState(false);
    const [activeLoginUser, setActiveLoginUser] = useState("");
    return (
        <header className="fixed inset-x-0 top-0 z-50 bg-[#1C2C56]">
            {/* <div className="w-full px-4 sm:px-6 lg:px-12"> */}
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
                <div className="flex h-14 items-center justify-between">
                    {/* Mobile Menu Button */}
                    {/* <button
            onClick={() => setIsOpen(true)}
            className="flex lg:hidden items-center text-white"
          >
            <TbMenu2 size={24} />
          </button> */}

                    {/* Mobile Drawer */}
                    <Drawer
                        title="Navigation"
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        onRequestClose={() => setIsOpen(false)}
                        width={260}
                        placement="left"
                    >
                        <div className="flex flex-col gap-4 text-white ">
                            <NavList onTabClick={() => setIsOpen(false)} tabs={navMenu} />
                        </div>
                    </Drawer>
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/img/logo/uniform-nav-logo.png"
                            width={70}
                            height={40}
                            alt="logo"
                            priority
                        />
                    </Link>
                    {/* Desktop Navigation */}
                    <nav className="flex flex-1 items-center justify-center text-sm font-medium text-white">
                        <NavList tabs={navMenu} />
                    </nav>
                    {/* Right Side (Desktop only) */}
                    <div className="items-center gap-8 text-white">
                        {/* {activeLoginUser !== "login" ? <AuthButtons /> : <NavOtherList />} */}
                         {session?.user?.email == undefined && (<AuthButtons />)}
            {session?.user?.email && (<NavOtherList />)}
                    </div>

                </div>
            </div>
        </header>
    )
}

export default Header

