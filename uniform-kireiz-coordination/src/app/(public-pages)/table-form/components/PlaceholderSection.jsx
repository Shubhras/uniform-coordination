import React from 'react'

const PlaceholderSection = () => {
    return (
        <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12 ">
            <div className=" px-6 md:px-10 py-10 md:py-16">

                {/* HEADER */}
                <div className="flex flex-col items-center gap-8">
                    <h2 className="text-2xl md:text-3xl font-semibold text-[#402936]">
                        Placeholder Text
                    </h2>
                    <p className="max-w-[650px] mx-auto text-[#402936] text-sm md:text-base">
                        Create unforgettable event experiences with our stunning table designs.
                    </p>
                    <div className="flex gap-10 items-center text-white">
                        <div className='bg-[#D4A6A6] rounded-md text-center w-[200px] md:py-4 py-2 md:px-8 px-4 cursor-pointer'>
                            <button>Start Designing</button>
                        </div>
                        <div className='bg-[#D4A6A6] rounded-md text-center w-[200px]  md:py-4 py-2 md:px-8 px-4 cursor-pointer'>
                            <button>Contact Us</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PlaceholderSection