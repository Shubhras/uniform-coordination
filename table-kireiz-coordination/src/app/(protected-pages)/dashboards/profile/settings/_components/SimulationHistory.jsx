'use client'

import React from 'react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import { FiExternalLink } from 'react-icons/fi'
import { LuPalette } from 'react-icons/lu'
import { LiaFileDownloadSolid } from 'react-icons/lia'

const simulations = [
    {
        img: '/img/kireiz-form/features/Venue.png',
        title: 'Medical & Nursing Care',
        date: 'Nov 15, 2025',
    }, {
        img: '/img/kireiz-form/features/Venue.png',
        title: 'Medical & Nursing Care',
        date: 'Nov 15, 2025',
    },
    {
        img: '/img/kireiz-form/features/Venue.png',
        title: 'Food Service & Dining',
        date: 'Nov 18, 2025',
    },
    {
        img: '/img/kireiz-form/features/Venue.png',
        title: 'Food Service & Dining',
        date: 'Nov 18, 2025',
    },
]

const SimulationHistory = () => {
    return (
        <div className="w-full bg-[#E8EEF842] md:p-8 p-5 rounded-2xl max-w-7xl mx-auto shadow-md">

            {/* HEADER */}
            <div className="mb-6">
                <h3 className="text-[18px] font-semibold flex items-center gap-1">
                    <LuPalette size={23} />
                    Simulation History
                </h3>
                <p className="text-[#6B7280] text-[14px] mt-1">
                    Your recent designs and customizations
                </p>
            </div>

            {/* FILTER BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                {/* Left filters */}
                <div className="flex gap-2">
                    <button className="bg-[#A0522D] hover:bg-[#8a5a75] text-white py-2 px-5 rounded-md"
                    >
                        All
                    </button>
                    <button className=" py-2 text-sm rounded-md border border-[#D0D7E2] px-5 text-[#0F2A44]">
                        Uniform
                    </button>
                    <button className=" py-2 text-sm rounded-md border border-[#D0D7E2] px-5 text-[#0F2A44] flex items-center gap-2">
                        <LiaFileDownloadSolid size={16} />
                        Download
                    </button>
                </div>

                {/* Right filters */}
                <div className="flex gap-3">
                    <select className="py-2 text-sm rounded-md border border-[#D0D7E2] px-5 text-[#0F2A44]">
                        <option>Sort: New first</option>
                    </select>
                    <select className="py-2 text-sm rounded-md border border-[#D0D7E2] px-5 text-[#0F2A44]">
                        <option>Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {simulations.map((item, i) => (
                    <div
                        key={i}
                        className="bg-white border border-[#CBD5E1] rounded-2xl p-3"
                    >
                        {/* Image */}
                        <div className="flex justify-center mb-6">
                            <div className="w-[240px] h-[240px] flex items-center justify-center overflow-hidden">
                                <Image
                                    src={item.img}
                                    width={240}
                                    height={240}
                                    alt={item.title}
                                    className="object-cover h-full w-full"
                                />
                            </div>
                        </div>

                        {/* Text */}
                        <h4 className=" text-[16px] font-semibold">
                            {item.title}
                        </h4>
                        <p className=" text-[13px] mt-1">
                            {item.date}
                        </p>

                        {/* Buttons */}
                        <div className="mt-6 flex gap-3">
                            {/* OPEN – wider */}
                            <Button
                                className="flex-[2] bg-[#A0522D] hover:bg-[#A0522D] text-white py-2 rounded-md"
                                size="sm"
                                icon={<FiExternalLink size={16} />}
                            >
                                OPEN
                            </Button>

                            {/* PDF – smaller */}
                            <Button
                                className="flex-[1] border border-[#A0522D] text-[#A0522D] rounded-md"
                                size="sm"
                                variant="default"
                                icon={<LiaFileDownloadSolid />}
                            >
                                PDF
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* PAGINATION DOTS */}
            <div className="flex justify-center gap-2 mt-8">
                <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
            </div>

            {/* LOAD MORE */}
            <div className="text-center mt-6">
                <button className="text-sm text-[#6B7280]">
                    Load more
                </button>
                <p className="text-xs text-[#9CA3AF] mt-1">
                    Showing 8 of 24 simulations
                </p>
            </div>

        </div>
    )
}

export default SimulationHistory
