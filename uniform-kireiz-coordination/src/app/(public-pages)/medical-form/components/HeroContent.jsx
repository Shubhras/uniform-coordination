'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

const HeroContent = () => {
    const router = useRouter()

    return (
        <section className="w-full bg-white px-4 lg:px-6 mt-10">
            <div className="max-w-7xl mx-auto relative">

                {/* ===== DESKTOP FRAME BG ===== */}
                <div className="hidden lg:block">
                    <Image
                        src="/img/medical-form/hero/bg.png"
                        width={1500}
                        height={900}
                        alt="Frame Background"
                        className="w-full object-contain pointer-events-none"
                    />
                </div>

                {/* ===== DESKTOP OVERLAY ===== */}
                <div className="hidden lg:block absolute inset-0 z-10">

                    {/* LEFT WHITE BG */}
                    <div className="absolute left-0 bottom-10 w-[50%]">
                        <Image
                            src="/img/medical-form/hero/white-bg.png"
                            alt="White Background"
                            width={600}
                            height={420}
                            className="w-full object-contain"
                        />

                        {/* TEXT ON WHITE BG */}
                        <div className="absolute top-15 left-15 flex flex-col justify-center p-10 w-[70%]">
                            <h1 className="text-[#1C2C56] text-5xl font-bold leading-tight mb-4">
                                Medical Care <br /> Uniforms
                            </h1>

                            <p className="text-[#6B7280] text-base mb-6 font-medium">
                                Professional, hygienic, and comfortable uniforms for healthcare excellence
                            </p>

                            <button
                                onClick={() => router.push('/kireiz-form')}
                                className="bg-[#1C2C56] text-white px-5 py-2 rounded-md text-sm font-medium w-fit"
                            >
                                Browse All Collection
                            </button>
                        </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="absolute right-0 top-0 w-[65%] h-[600px]">
                        <Image
                            src="/img/medical-form/hero/doctors.png"
                            alt="Medical Team"
                            fill
                            className="object-contain object-right-top"
                            priority
                        />
                    </div>
                </div>

                {/* ===== MOBILE / TABLET VERSION ===== */}
                <div className="lg:hidden flex flex-col gap-6">

                    {/* IMAGE FULL WIDTH */}
                    <div className="relative w-full min-h-96 rounded-b-[50px] overflow-hidden">
                        <Image
                            src="/img/medical-form/hero/doctors.png"
                            alt="Medical Team"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                    </div>

                    {/* TEXT BELOW IMAGE */}
                    <div className="text-center px-2">
                        <h1 className="text-[#1C2C56] text-3xl md:text-4xl font-bold mb-3">
                            Medical Care Uniforms
                        </h1>

                        <p className="text-[#6B7280] text-sm md:text-base mb-5">
                            Professional, hygienic, and comfortable uniforms for healthcare excellence
                        </p>

                        <button
                            onClick={() => router.push('/kireiz-form')}
                            className="bg-[#1C2C56] text-white px-6 py-2 rounded-md text-sm font-medium"
                        >
                            Browse All Collection
                        </button>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default HeroContent
