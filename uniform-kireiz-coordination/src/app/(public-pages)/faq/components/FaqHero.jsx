'use client'
import React from 'react'

const FaqHero = () => {
    return (
        <section className="w-full mt-14">
            <div
                className="w-full rounded-br-[60px] bg-gradient-to-r from-[#005CA7] to-[#daebfa]">
                <div className="max-w-7xl mx-auto lg:px-0 px-4 py-16">
                    <div className="max-w-xl  space-y-3">
                        <h1 className="text-3xl text-white md:text-4xl font-semibold">
                            FAQ’s
                        </h1>
                        <p className="text-sm md:text-base text-white">
                            Here’s a little more about how we operate. Got a
                            more specific question? Feel free to get in touch
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FaqHero
