'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PiPhone, PiInstagramLogoFill } from "react-icons/pi";
import { FaLinkedin, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

/**
 * FooterPage Component.
 * Renders application global footer with company details, navigation links, and social media icons.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.mode - Current theme mode ('light' | 'dark').
 * @returns {JSX.Element} Global application footer section.
 */
const FooterPage = ({ mode }) => {
    const year = new Date().getFullYear()

    const router = useRouter()

    /**
     * Handles preview button navigation.
     */
    const handlePreview = () => {
        router.push('/kireiz-form')
    }

    const handleSocialClick = (platform) => {
        toast.push(
            <Notification title="Coming soon!" type="info">
                {platform} channel will be available soon.
            </Notification>
        )
    }

    return (
        <>
            <footer className="bg-[#171a4b] text-white pt-16">
                <div className=" mx-auto px-5 md:px-8 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="max-w-[300px]">
                            <img
                                src="/img/logo/image2.png"
                                width={130}
                                alt="logo"
                                className="mb-6"
                            />
                            <p className="text-sm mb-4">
                                Our vision is to provide convenience and help increase your sales business.
                            </p>
                            <div className="font-semibold text-white mt-6 mb-3">
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
                                    className="hover:underline hover:text-gray-300 transition-colors"
                                >
                                    saksri.s@eqho.com
                                </a>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center max-w-[350px]">
                            <h3 className="font-semibold mb-4 text-lg text-white">
                                Contact Channels
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('LinkedIn')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <FaLinkedin className='text-lg' /> LinkedIn
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('Instagram')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <PiInstagramLogoFill size={20} /> Instagram
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('X')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <FaXTwitter className='text-lg' /> X
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('YouTube')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <FaYoutube className='text-lg' /> Youtube
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('G2')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <img
                                        src="/img/logo/icone-g2.png"
                                        alt="G2"
                                        className="w-5 h-5"
                                    />
                                    G2
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('TikTok')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <FaTiktok className='text-lg' /> TikTok
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/20 mt-12 bg-white">
                    <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4
                    flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <p className="text-[#2D3E72] font-semibold">
                            ©{year} KIREIZ FORM. All rights reserved.
                        </p>
                        <div className="flex gap-6 font-semibold text-[#2D3E72]">
                            <Link href='/private-policy'  className="hover:underline">Privacy & Policy</Link>
                            <Link href='/terms-and-condition' className="hover:underline">Terms & Condition</Link>
                        </div>
                    </div>
                </div>
            </footer>
            {/* <footer className="bg-[#8A5A75] text-white pt-16">
                <div className=" mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            <div className="font-semibold text-white mt-6 mb-3">
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
                                    className="hover:underline hover:text-gray-300 transition-colors"
                                >
                                    saksri.s@eqho.com
                                </a>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center max-w-[350px]">
                            <h3 className="font-semibold mb-4 text-lg text-white">
                                Contact Channels
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('LinkedIn')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <FaLinkedin className='text-lg' /> LinkedIn
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('Instagram')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <PiInstagramLogoFill size={20} /> Instagram
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('X')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <FaXTwitter className='text-lg' /> X
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('YouTube')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <FaYoutube className='text-lg' /> Youtube
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('G2')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <img
                                        src="/img/logo/icone-g2.png"
                                        alt="G2"
                                        className="w-5 h-5"
                                    />
                                    G2
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialClick('TikTok')}
                                    className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                    <FaTiktok className='text-lg' /> TikTok
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/20 mt-12 bg-white">
                    <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4
                    flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <p className="text-[#000000] font-semibold">
                            ©{year} KIREIZ FORM. All rights reserved.
                        </p>
                        <div className="flex gap-6 font-semibold text-[#000000]">
                            <Link href="#" className="hover:underline">Privacy & Policy</Link>
                            <Link href="#" className="hover:underline">Terms & Condition</Link>
                        </div>
                    </div>
                </div>
            </footer> */}
        </>
    )
}

export default FooterPage


