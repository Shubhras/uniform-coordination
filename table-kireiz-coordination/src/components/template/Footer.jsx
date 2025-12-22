import Container from '@/components/shared/Container'
import classNames from '@/utils/classNames'
import { APP_NAME } from '@/constants/app.constant'
import { PAGE_CONTAINER_GUTTER_X } from '@/constants/theme.constant'
import Link from 'next/link'
import { PiPhone, PiInstagramLogoFill } from "react-icons/pi";
import { FaLinkedin, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiG2 } from 'react-icons/si'
// const FooterContent = () => {
//     return (
//         <div className="flex items-center justify-between flex-auto w-full">
//             <span>
//                 Copyright &copy; {`${new Date().getFullYear()}`}{' '}
//                 <span className="font-semibold">{`${APP_NAME}`}</span> All
//                 rights reserved.
//             </span>
//             <div className="">
//                 <Link
//                     className="text-gray"
//                     href="/#"
//                     onClick={(e) => e.preventDefault()}
//                 >
//                     Term & Conditions
//                 </Link>
//                 <span className="mx-2 text-muted"> | </span>
//                 <Link
//                     className="text-gray"
//                     href="/#"
//                     onClick={(e) => e.preventDefault()}
//                 >
//                     Privacy & Policy
//                 </Link>
//             </div>
//         </div>
//     )
// }

export default function Footer({ pageContainerType = 'contained', className }) {
    const year = new Date().getFullYear()
    return (
        // <footer
        //     className={classNames(
        //         `footer flex flex-auto items-center h-16 ${PAGE_CONTAINER_GUTTER_X}`,
        //         className,
        //     )}
        // >
        //     {pageContainerType === 'contained' ? (
        //         <Container>
        //             <FooterContent />
        //         </Container>
        //     ) : (
        //         <FooterContent />
        //     )}
        // </footer>
        // <footer className="bg-[#171a4b] text-white pt-16">
        //     <div className=" mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        //         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        //             <div className="max-w-[300px]">
        //                 <img
        //                     src="/img/logo/image2.png"
        //                     width={130}
        //                     alt="logo"
        //                     className="mb-6"
        //                 />
        //                 <p className="text-sm mb-4">
        //                     Our vision is to provide convenience and help increase your sales business.
        //                 </p>
        //                 <div className="font-semibold text-white mt-6 mb-3">
        //                     Support
        //                 </div>
        //                 <div className="flex items-center gap-2 text-sm">
        //                     <PiPhone size={18} />
        //                     <p>+123 456 7890</p>
        //                 </div>
        //                 <div className="flex items-center gap-2 text-sm mt-2">
        //                     <span className="text-lg">@</span>
        //                     <p>support@mm.com</p>
        //                 </div>
        //             </div>
        //             <div className="flex flex-col justify-center max-w-[350px]">
        //                 <h3 className="font-semibold mb-4 text-lg text-white">
        //                     Contact Channels
        //                 </h3>
        //                 <div className="flex flex-wrap gap-3">
        //                     <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
        //                         <FaLinkedin className='text-lg' /> LinkedIn
        //                     </button>
        //                     <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
        //                         <PiInstagramLogoFill size={20} /> Instagram
        //                     </button>
        //                     <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
        //                         <FaXTwitter className='text-lg' /> X
        //                     </button>
        //                     <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
        //                         <FaYoutube className='text-lg' /> Youtube
        //                     </button>
        //                     <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
        //                         <img
        //                             src="/img/logo/icone-g2.png"
        //                             alt="G2"
        //                             className="w-5 h-5"
        //                         />
        //                         G2
        //                     </button>
        //                     <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
        //                         <FaTiktok className='text-lg' /> TikTok
        //                     </button>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        //     <div className="border-t border-white/20 mt-12 bg-white">
        //         <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4
        //             flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        //             <p className="text-[#2D3E72] font-semibold">
        //                 ©{year} KIREIZ FORM. All rights reserved.
        //             </p>
        //             <div className="flex gap-6 font-semibold text-[#2D3E72]">
        //                 <Link href="#" className="hover:underline">Privacy & Policy</Link>
        //                 <Link href="#" className="hover:underline">Terms & Condition</Link>
        //             </div>
        //         </div>
        //     </div>
        // </footer>
        <footer className="bg-[#E8B4A9] text-black pt-16">
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
                        <div className="font-semibold text-black mt-6 mb-3">
                            Support
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <PiPhone size={18} />
                            <p>+123 456 7890</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="text-lg">@</span>
                            <p>support@mm.com</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center max-w-[350px]">
                        <h3 className="font-semibold mb-4 text-lg text-black">
                            Contact Channels
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <FaLinkedin className='text-lg' /> LinkedIn
                            </button>
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <PiInstagramLogoFill size={20} /> Instagram
                            </button>
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <FaXTwitter className='text-lg' /> X
                            </button>
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <FaYoutube className='text-lg' /> Youtube
                            </button>
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                <SiG2 className='text-lg' />
                                G2
                            </button>
                            <button className="border-[1px] border-[#737373] px-4 py-2 rounded-full flex items-center gap-2 text-sm">
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
                        <Link href='/private-policy'  className="hover:underline">Privacy & Policy</Link>
                        <Link href='/terms-and-condition' className="hover:underline">Terms & Condition</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
