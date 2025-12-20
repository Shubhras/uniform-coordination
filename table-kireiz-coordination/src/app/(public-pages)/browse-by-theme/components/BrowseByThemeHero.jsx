import Image from 'next/image'
import React from 'react'

const BrowseByThemeHero = () => {
    return (
        <section className="w-full mt-14">
            <div className="relative w-full h-[300px]  overflow-hidden">

                {/* IMAGE */}
                <Image
                    src="/img/table-form/themes/theme2.png"
                    alt="Table Design"
                    fill
                    priority
                    className="object-cover object-center blur-[2px] scale-105"
                />

                {/* GRADIENT OVERLAY */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
                          linear-gradient(
                            120.02deg,
                            rgba(255,255,255,0) 10%,
                            rgba(255,255,255,0.45) 45%,
                            rgba(255,255,255,0) 80%
                          )
                        `,
                        opacity: 0.9
                    }}
                />

                {/* TEXT */}
                <h1 className="
                    absolute
                    top-1/2 left-1/2
                    -translate-x-1/2 -translate-y-1/2
                    lg:text-5xl
                    md:text-4xl
                    text-3xl
                    font-bold
                    text-[#7B3C1D]
                    z-10
                    text-center
                    w-full
                ">
                    Browse By Theme
                </h1>
            </div>
        </section>
    )
}

export default BrowseByThemeHero
