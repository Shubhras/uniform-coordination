import Container from './LandingContainer'
import Button from '@/components/ui/Button'
import AuroraBackground from './AuroraBackground'
import { motion } from 'framer-motion'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { FaLinkedin, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const LandingFooter = ({ mode }) => {
    const year = new Date().getFullYear()

    const router = useRouter()

    const handlePreview = () => {
        // router.push('/dashboards/ecommerce')
        router.push('/kireiz-form')
    }

    return (
        // <div id="footer" className="relative z-20">
        //     <Container className="relative">
        //         <div className="py-10 md:py-40">
        //             <AuroraBackground
        //                 className="rounded-3xl"
        //                 auroraClassName="rounded-3xl"
        //             >
        //                 <motion.div
        //                     initial={{ opacity: 0.0, y: 40 }}
        //                     whileInView={{ opacity: 1, y: 0 }}
        //                     transition={{
        //                         delay: 0.3,
        //                         duration: 0.3,
        //                         ease: 'easeInOut',
        //                     }}
        //                     className="relative flex flex-col gap-4 items-center justify-center py-20 px-8 text-center"
        //                 >
        //                     <h2 className="text-5xl">Ready to Get Started?</h2>
        //                     <p className="mt-4 max-w-[400px] mx-auto">
        //                         Build modern, scalable applications effortlessly
        //                         with Ecme. Take your project to the next level
        //                         today!
        //                     </p>
        //                     <div className="mt-6">
        //                         <Button variant="solid" onClick={handlePreview}>
        //                             Get Started Now
        //                         </Button>
        //                     </div>
        //                 </motion.div>
        //             </AuroraBackground>
        //         </div>
        //         <div className="py-6 border-t border-gray-200 dark:border-gray-800">
        //             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        //                 <Link href="/">
        //                     {mode === MODE_LIGHT && (
        //                         <img
        //                             src="/img/logo/logo-light-full.png"
        //                             width={120}
        //                             height={40}
        //                             alt="logo"
        //                         />
        //                     )}
        //                     {mode === MODE_DARK && (
        //                         <img
        //                             src="/img/logo/logo-dark-full.png"
        //                             width={120}
        //                             height={40}
        //                             alt="logo"
        //                         />
        //                     )}
        //                 </Link>
        //                 <p className="text-center">
        //                     Copyright © {year} Kireiz Form - Uniform Coordination. All rights reserved.
        //                 </p>
        //             </div>
        //         </div>
        //     </Container>
        // </div>
        <>
            <footer className="bg-[#171a4b] text-white pt-16 ">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className='max-w-[300px]'> 
                        <img
                            src="/img/logo/image2.png"
                            width={130}
                            alt="logo"
                            className="mb-6"
                        />
                        <p className="text-sm mb-2">
                            Our vision is to provide convenience and help increase your sales business.
                        </p>
                        <div className="font-semibold text-[#fff] mt-6 mb-3">Support</div>
                        <div className="flex items-center gap-2 text-sm">
                            <span>📞</span> <p>+123 456 7890</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span>@</span> <p>support@mm.com</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-start max-w-[350px] justify-center">
                        <h3 className="font-semibold mb-4 text-lg text-[#fff]">Contact Channels</h3>
                        <div className="flex flex-wrap justify-flex-start gap-4">
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <FaLinkedin /> LinkedIn
                            </button>

                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <FaInstagram /> Instagram
                            </button>
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <FaXTwitter /> X
                            </button>
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <FaYoutube /> Youtube
                            </button>
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <span>G2</span>
                            </button>
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <FaTiktok /> TikTok
                            </button>
                        </div>
                    </div>
                </div>


                <div className="border-t border-white/20 mt-12 pt-4 bg-white pb-5 text-black">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm gap-4">

                        <p className="text-[#2D3E72] font-semibold">
                            ©{year} KIREIZ FORM. All rights reserved.
                        </p>

                        <div className="text-[#2D3E72] flex gap-6 font-semibold">
                            <Link href="#" className="hover:underline">
                                Privacy & Policy
                            </Link>
                            <Link href="#" className="hover:underline">
                                Terms & Condition
                            </Link>
                        </div>

                    </div>
                </div>
            </footer>
        </>
    )
}

export default LandingFooter
