'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * UniformSingle Component
 * 
 * Displays individual static product details, description, color selector, and customization trigger button.
 */
const UniformSingle = () => {
    const router = useRouter()
    const [circleColor, setCircleColor] = useState('#BFE3F9')
    const colors = [
        '#1C2C56',
        '#000000',
        '#BFE3F9',
        '#A7F3D0',
        '#FEF08A'
    ]

    /**
     * Navigates to the 3D uniform customization editor.
     */
    const handleUniformDesigning = () => {
        router.push("/dashboards/uniform-3d-design");
    };

    return (
        <section className="w-full bg-white flex flex-col lg:flex-row px-6 lg:px-4 py-4 gap-10 mt-15">
            <div className="w-full mx-auto px-4">
                <p className='text-sm text-[#486284] py-5'>My dashboard / Medical Care Uniforms</p>

                {/* Header */}
                <div className='bg-[#F5F8FF] rounded-xl md:p-8 p-5'>
                    <div className="text-center mb-12">
                        <h2 className="text-[#1C2C56] text-3xl font-semibold">
                            Placeholder Text
                        </h2>
                        <div className="w-20 h-1 bg-[#1C2C56] mx-auto mt-2 rounded-full" />
                        <p className="text-[#6B7280] mt-3 text-sm">
                            Comfortable, functional scrubs for healthcare professionals
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Left Info Card */}
                        <div className="order-2 lg:order-1 bg-white border border-[#1C2C56] rounded-[20px] p-8 flex flex-col h-full">
                            <div className="flex flex-col gap-5">
                                <h3 className="text-[#1C2C56] text-2xl font-semibold">
                                    Item Name
                                </h3>
                                <div className="flex justify-between items-center text-xs">
                                    <p className="text-[#6B7280]">
                                        Style#: UTSC03BLU
                                    </p>
                                    <span className="text-green-600 text-sm font-medium">
                                        Save 20%
                                    </span>
                                </div>
                            </div>
                            <button
                                className="w-full bg-[#1C2C56] text-white py-3 rounded-md text-sm font-medium mt-6"
                                onClick={handleUniformDesigning}
                            >
                                Customize
                            </button>
                            <div className="pt-4 space-y-3 flex-1">
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

                        {/* Right Image with Color Accent Circle */}
                        <div className="order-1 lg:order-2 relative flex justify-center">
                            <div className="absolute right-0 top-10 flex flex-col items-center gap-3 z-20">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setCircleColor(color)}
                                        className={`w-8 h-10 rounded border ${circleColor === color ? 'ring-1' : ''}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <button className="mt-2 text-[8px] w-8 h-10 p-1 border border-gray-300 rounded text-gray-600 bg-white">
                                    View All
                                </button>
                            </div>
                            <div
                                className="absolute w-[380px] h-[380px] rounded-full transition-colors duration-300"
                                style={{ backgroundColor: circleColor }}
                            />
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
                </div>

                {/* Size Guide Chart */}
                <div className='md:p-10 p-5 border-x-2 border-t-2 rounded-xl border-[#87CEEB]'>
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