'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PiPhone, PiInstagramLogoFill } from "react-icons/pi";
import { FaLinkedin, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiG2 } from 'react-icons/si';
import { IoIosArrowUp } from 'react-icons/io';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';

/**
 * FooterPage Component
 * 
 * Renders global application footer with company branding, contact support channels, navigation links, and scroll-to-top feature.
 * 
 * @param {Object} props - Component props.
 * @param {string} props.mode - Current theme mode ('light' | 'dark').
 */
const FooterPage = ({ mode }) => {
    const year = new Date().getFullYear()
    const router = useRouter()

    /**
     * Smoothly scrolls the window back to the top.
     */
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    /**
     * Navigates to the table form route.
     */
    const handlePreview = () => {
        router.push('/table-form')
    }

    const handleSocialClick = (platform) => {
        toast.push(
            <Notification title="Coming soon!" type="info">
                {platform} channel will be available soon.
            </Notification>
        )
    }

    return (
        <footer className="bg-[#E8B4A9] text-black pt-16">
            <div className="mx-auto px-5 md:px-8 lg:px-12">
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Brand Info & Support */}
                    <div className="max-w-[300px]">
                        <img
                            src="/img/logo/logo-table-footer.png"
                            width={130}
                            alt="logo"
                            className="mb-6"
                        />
                        <p className="text-sm mb-4">
                            Our vision is to provide convenience and help increase your sales business.
                        </p>
                        <div className="font-semibold text-black mt-6 mb-3">
                            Support
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <PiPhone size={18} />
                            <p>+123 456 7890</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="text-lg">@</span>
                            <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=saksri.s@eqho.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline hover:text-[#5A3E2B] transition-colors"
                            >
                                saksri.s@eqho.com
                            </a>
                        </div>
                    </div>

                    {/* Contact Channels */}
                    <div className="flex flex-col justify-center max-w-[350px]">
                        <h3 className="font-semibold mb-4 text-lg text-black">
                            Contact Channels
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => handleSocialClick('LinkedIn')}
                                className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-black/5 transition-colors"
                            >
                                <FaLinkedin className='text-lg' /> LinkedIn
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialClick('Instagram')}
                                className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-black/5 transition-colors"
                            >
                                <PiInstagramLogoFill size={20} /> Instagram
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialClick('X')}
                                className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-black/5 transition-colors"
                            >
                                <FaXTwitter className='text-lg' /> X
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialClick('YouTube')}
                                className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-black/5 transition-colors"
                            >
                                <FaYoutube className='text-lg' /> Youtube
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialClick('G2')}
                                className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-black/5 transition-colors"
                            >
                                <SiG2 className='text-lg' />
                                G2
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialClick('TikTok')}
                                className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-black/5 transition-colors"
                            >
                                <FaTiktok className='text-lg' /> TikTok
                            </button>
                        </div>
                    </div>

                    {/* Scroll To Top Button */}
                    <button
                        onClick={scrollToTop}
                        aria-label="Scroll to top"
                        className="bg-white h-fit rounded-full p-3 hover:shadow-md transition absolute top-0 right-0"
                    >
                        <IoIosArrowUp size={20} className="text-black" />
                    </button>
                </div>
            </div>

            {/* Sub-Footer Copyright & Legal Links */}
            <div className="border-t border-white/20 mt-12 bg-white">
                <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#A9ACB3]">
                    <p className="font-semibold">
                        ©{year} KIREIZ SPACE. All rights reserved.
                    </p>
                    <div className="flex gap-6 font-semibold">
                        <Link href='/private-policy' className="hover:underline">Privacy & Policy</Link>
                        <Link href='/terms-and-condition' className="hover:underline">Terms & Condition</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default FooterPage
