'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

const HeroContent = () => {
    const router = useRouter()

    return (
        // <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12">
        //     {/* FULL WIDTH BG */}
        //     <div className="w-full bg-[#dce4f7] rounded-br-[100px] overflow-hidden">

        //         {/* INNER CONTENT WRAPPER (replaces max-w-7xl look) */}
        //         <div className="relative mx-auto px-4 lg:px-12 xl:px-24">

        //             {/* ===== DESKTOP ===== */}
        //             <div className="hidden lg:block relative min-h-[80vh]">

        //                 {/* LEFT WHITE BG */}
        //                 <div className="absolute left-0 bottom-10 w-[50%]">
        //                     <Image
        //                         src="/img/medical-form/hero/white-bg.png"
        //                         alt="White Background"
        //                         width={550}
        //                         height={360}
        //                         className="w-full object-cover"
        //                     />

        //                     {/* TEXT */}
        //                     <div className="absolute inset-0 flex flex-col justify-center p-10 w-[80%]">
        //                         <h1 className="text-[#1C2C56] text-5xl font-bold leading-tight mb-4">
        //                             Medical Care <br /> Uniforms
        //                         </h1>

        //                         <p className="text-[#6B7280] text-base mb-6 font-medium">
        //                             Professional, hygienic, and comfortable uniforms for healthcare excellence
        //                         </p>

        //                         <button
        //                             onClick={() => router.push('/kireiz-form')}
        //                             className="bg-[#1C2C56] text-white px-5 py-2 rounded-md text-sm font-medium w-fit"
        //                         >
        //                             Browse All Collection
        //                         </button>
        //                     </div>
        //                 </div>

        //                 {/* RIGHT IMAGE */}
        //                 <div className="absolute right-0 top-0 w-[60%] h-[700px]">
        //                     <Image
        //                         src="/img/medical-form/hero/doctors.png"
        //                         alt="Medical Team"
        //                         fill
        //                         className="object-contain object-right-top"
        //                         priority
        //                     />
        //                 </div>
        //             </div>

        //             {/* ===== MOBILE / TABLET ===== */}
        //             <div className="lg:hidden flex flex-col gap-6">

        //                 {/* IMAGE */}
        //                 <div className="relative w-full min-h-96 rounded-b-[50px] overflow-hidden">
        //                     <Image
        //                         src="/img/medical-form/hero/doctors.png"
        //                         alt="Medical Team"
        //                         fill
        //                         className="object-cover object-center"
        //                         priority
        //                     />
        //                 </div>

        //                 {/* TEXT */}
        //                 <div className="text-center px-2 pb-8">
        //                     <h1 className="text-[#1C2C56] text-3xl md:text-4xl font-bold mb-3">
        //                         Medical Care Uniforms
        //                     </h1>

        //                     <p className="text-[#6B7280] text-sm md:text-base mb-5">
        //                         Professional, hygienic, and comfortable uniforms for healthcare excellence
        //                     </p>

        //                     <button
        //                         onClick={() => router.push('/kireiz-form')}
        //                         className="bg-[#1C2C56] text-white px-6 py-2 rounded-md text-sm font-medium"
        //                     >
        //                         Browse All Collection
        //                     </button>
        //                 </div>
        //             </div>

        //         </div>
        //     </div>
        // </section>
        <section className="w-full bg-white px-4 sm:px-0 md:px-0 lg:px-0">
            <div className="w-full bg-[#dce4f7] rounded-br-[100px] overflow-hidden">
                <div className="relative mx-auto">

                    {/* ===== DESKTOP ===== */}
                    <div className="hidden lg:block relative min-h-[600px] mb-25">

                        {/* LEFT WHITE CARD */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[45%] z-0 bottom-[55px]">
                            <div className="bg-white rounded-tl-[60px] rounded-tr-[60px] rounded-br-[60px] px-16 py-20 shadow-[0_30px_80px_rgba(28,44,86,0.15)]">

                                <h1 className="text-[#1C2C56] text-5xl font-bold leading-tight mb-4">
                                    Medical Care <br /> Uniforms
                                </h1>

                                <p className="text-[#6B7280] text-base mb-6 font-medium max-w-md">
                                    Professional, hygienic, and comfortable uniforms for healthcare excellence
                                </p>

                                <button
                                    onClick={() => router.push("/kireiz-form")}
                                    className="bg-[#1C2C56] text-white px-6 py-3 rounded-md text-sm font-medium w-fit"
                                >
                                    Browse All Collection
                                </button>

                            </div>
                        </div>

                        {/* RIGHT IMAGE */}
                        <div className="absolute right-0 bottom-0 w-[62%] h-[600px] z-10 overflow-hidden">
                            <img
                                src="/img/medical-form/hero/doctors.png"
                                alt="Medical Team"
                                className="w-full h-full object-cover object-right-bottom"
                            />
                        </div>
                    </div>

                    {/* ===== MOBILE / TABLET (UNCHANGED) ===== */}
                    <div className="lg:hidden flex flex-col gap-6">

                        <div className="relative w-full min-h-96 rounded-b-[50px] overflow-hidden">
                            <Image
                                src="/img/medical-form/hero/doctors.png"
                                alt="Medical Team"
                                fill
                                className="object-cover object-center"
                                priority
                            />
                        </div>

                        <div className="text-center px-2 pb-8">
                            <h1 className="text-[#1C2C56] text-3xl md:text-4xl font-bold mb-3">
                                Medical Care Uniforms
                            </h1>

                            <p className="text-[#6B7280] text-sm md:text-base mb-5">
                                Professional, hygienic, and comfortable uniforms for healthcare excellence
                            </p>

                            <button
                                onClick={() => router.push("/kireiz-form")}
                                className="bg-[#1C2C56] text-white px-6 py-2 rounded-md text-sm font-medium"
                            >
                                Browse All Collection
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default HeroContent
