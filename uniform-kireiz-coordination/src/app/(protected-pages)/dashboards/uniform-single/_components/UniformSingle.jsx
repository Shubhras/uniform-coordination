'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
const UniformSingle = () => {
    const router = useRouter()

    const handleUniformDesigning = () => {
        router.push("/dashboards/project");
    };

    return (
        <section className="w-full py-14 bg-[#F5F8FF]">
            <div className="max-w-7xl mx-auto px-4">

                <p className='text-sm text-[#486284] py-5'>My dashboard / Medical Care Uniforms</p>
                {/* HEADER */}
                <div className="text-center mb-12">
                    <h2 className="text-[#1C2C56] text-3xl font-semibold">
                        Placeholder Text
                    </h2>
                    <div className="w-20 h-1 bg-[#1C4FA8] mx-auto mt-2 rounded-full" />
                    <p className="text-[#6B7280] mt-3 text-sm">
                        Comfortable, functional scrubs for healthcare professionals
                    </p>
                </div>

                {/* MAIN CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ">

                    {/* LEFT INFO CARD */}
                    <div className="order-2 lg:order-1 bg-white border border-[#1C4FA8] rounded-[20px] p-8 space-y-6">

                        <div className=" flex flex-col gap-5">
                            <h3 className="text-[#1C2C56] text-2xl font-semibold">
                                Item Name
                            </h3>
                            <div className='flex justify-between items-center text-xs'>
                                <p className=" text-[#6B7280] mt-1">
                                    Style#: UTSC03BLU
                                </p>
                                <span className="text-green-600 text-sm font-medium">
                                    Save 20%
                                </span>
                            </div>


                        </div>

                        <button className="w-full bg-[#1C4FA8] text-white py-3 rounded-md text-sm font-medium"
                         onClick={handleUniformDesigning}
                         >
                            Customize
                        </button>

                        <div className="pt-4 space-y-3">
                            <h4 className="text-[#1C2C56] font-semibold">
                                Description
                            </h4>

                            <p className="text-[#6B7280] text-sm leading-relaxed">
                                This kitchen wear uniform set is perfect for the professional.
                                Stylish lapel collar and button front closure with easy care
                                make this durable lab coat a great choice.
                            </p>

                            <p className="text-[#6B7280] text-sm leading-relaxed">
                                Two patch pockets provide the perfect place to keep your
                                essential medical accessories. This coat gives style and
                                comfort with its 35 inches length.
                            </p>

                            <p className="text-[#6B7280] text-sm leading-relaxed">
                                Available in 65/35 polyester-cotton blended fabric, this
                                stylish, comfortable, and long-lasting lab coat is an
                                excellent choice for any clinic or hospital.
                            </p>

                            <p className="text-[#6B7280] text-sm leading-relaxed">
                                Personalize it by adding your Kitchen or Cafe name and logo
                                with our customized print or embroidery options!
                            </p>
                        </div>
                    </div>

                    {/* RIGHT IMAGE WITH BLUE CIRCLE */}
                    <div className=" order-1 lg:order-2 relative flex justify-center">

                        {/* BLUE CIRCLE */}
                        <div className="absolute w-[320px] h-[320px] md:w-[380px] md:h-[380px] bg-[#BFE3F9] rounded-full" />

                        {/* IMAGE */}
                        <div className="relative z-10">
                            <Image
                                src="/img/uniform/uniform.png"
                                alt="Uniform"
                                width={450}
                                height={800}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                </div>

                <div className='mt-10'>
                    <h1 className='text-4xl font-semibold mb-2'>Size Guide</h1>
                    <div className='flex items-center justify-center'>

                        <Image
                            src="/img/uniform/chart.png"
                            alt="Uniform"
                            width={800}
                            height={800}
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default UniformSingle
