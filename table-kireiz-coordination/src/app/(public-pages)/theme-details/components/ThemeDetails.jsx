'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AiOutlineExpand } from 'react-icons/ai'
import { CiCircleInfo } from 'react-icons/ci'
import { FiBox, FiChevronDown, FiChevronLeft } from 'react-icons/fi'
import { apiGetSindleThemeDetails } from '@/services/HomeService'

const ThemeDetails = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const scrollRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [open, setOpen] = useState(false)
    const [openSections, setOpenSections] = useState([0])
    const [theme, setTheme] = useState({
        title: 'Loading Theme...',
        description: 'Please wait while we load the theme details.',
        gallery: ['/img/placeholder.png'],
        packageLabel: 'Items Included',
        packageValueLabel: 'Estimated Package Value',
        priceLabel: 'Price TBD',
        items: [
            { title: 'Table Setup', items: [] },
            { title: 'Floral & Decor', items: [] },
            { title: 'Seating', items: [] },
            { title: 'Additional Elements', items: [] }
        ]
    })

    const idParam = searchParams.get('id')
    const themeIdParam = searchParams.get('themeId')
    const selectedThemeId = idParam || themeIdParam

    useEffect(() => {
        if (selectedThemeId) {
            const fetchSingleTheme = async () => {
                try {
                    const response = await apiGetSindleThemeDetails(selectedThemeId);
                    if (response?.status === true && response?.data) {
                        const apiData = response.data;
                        const formattedTheme = {
                            ...apiData,
                            gallery: apiData.cover_images?.length > 0 ? apiData.cover_images.map(c => c.image) : (apiData.image ? [apiData.image] : ['/img/placeholder.png']),
                            packageLabel: 'Items Included',
                            packageValueLabel: 'Estimated Package Value',
                            priceLabel: 'Price TBD',
                            items: [
                                {
                                    title: 'Table Setup',
                                    items: apiData.theme_items?.table_setup?.map(item => ({ name: item.product_details?.productName || 'Unknown Item', qty: 'x1' })) || []
                                },
                                {
                                    title: 'Floral & Decor',
                                    items: apiData.theme_items?.floral_decor?.map(item => ({ name: item.product_details?.productName || 'Unknown Item', qty: 'x1' })) || []
                                },
                                {
                                    title: 'Seating',
                                    items: apiData.theme_items?.seating?.map(item => ({ name: item.product_details?.productName || 'Unknown Item', qty: 'x1' })) || []
                                },
                                {
                                    title: 'Additional Elements',
                                    items: apiData.theme_items?.additional_elements?.map(item => ({ name: item.product_details?.productName || 'Unknown Item', qty: 'x1' })) || []
                                }
                            ]
                        };
                        setTheme(formattedTheme);
                    }
                } catch (error) {
                    console.error("Error fetching single theme details:", error);
                }
            };
            fetchSingleTheme();
        }
    }, [idParam, themeIdParam, selectedThemeId])

    const totalItems = theme ? theme.items.reduce(
        (count, section) => count + section.items.length,
        0,
    ) : 0;

    const toggleSection = (index) => {
        setOpenSections((prev) =>
            prev.includes(index)
                ? prev.filter((itemIndex) => itemIndex !== index)
                : [...prev, index],
        )
    }

    const scrollToIndex = (index) => {
        if (!scrollRef.current) return

        const width = scrollRef.current.offsetWidth
        scrollRef.current.scrollTo({
            left: index * width,
            behavior: 'smooth',
        })
        setActiveIndex(index)
    }

    const handleScroll = () => {
        const element = scrollRef.current
        if (!element) return

        const index = Math.round(element.scrollLeft / element.offsetWidth)
        setActiveIndex(index)
    }

    const handleCustomizeClick = () => {
        const targetId = theme.id || selectedThemeId;
        router.push(
            `/dashboards/uniform-3d-design?themeId=${targetId}&id=${targetId}`,
        )
    }

    useEffect(() => {
        setActiveIndex(0)
        setOpen(false)
        setOpenSections([0])
        scrollRef.current?.scrollTo({ left: 0 })
    }, [theme?.id])

    return (
        <section className="w-full mx-auto px-4 sm:px-5 md:px-8 lg:px-12 py-8 sm:py-10 mt-15">
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8 mb-6">
                <div className="flex-1 w-full">
                    <button
                        type="button"
                        onClick={() => router.push('/browse-by-theme')}
                        className="flex items-center gap-2 text-[#7B3C1D] font-bold text-xl sm:text-2xl md:text-3xl xl:text-4xl"
                    >
                        <FiChevronLeft size={26} className="sm:hidden" />
                        <FiChevronLeft size={30} className="hidden sm:block" />
                        <span>{theme.title}</span>
                    </button>

                    <p className="text-xs sm:text-sm md:text-base text-[#8B5A3C] mt-2 pl-8 sm:pl-10">
                        {theme.description}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={() => router.push('/browse-by-theme')}
                        className="w-full sm:w-auto whitespace-nowrap text-sm sm:text-base md:text-lg font-medium px-4 py-2 rounded-md bg-[#D4A6A6] border border-white text-white"
                    >
                        Back to Theme
                    </button>

                    <button
                        type="button"
                        onClick={handleCustomizeClick}
                        className="w-full sm:w-auto whitespace-nowrap text-sm sm:text-base md:text-lg font-medium px-4 py-2 rounded-md bg-[#A0614D] border border-white text-white"
                    >
                        Customize in Canva
                    </button>
                </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-6 md:gap-8">
                <div className="md:w-[70%] w-full space-y-6">
                    <div className="relative rounded-xl overflow-hidden shadow">
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar touch-pan-x"
                        >
                            {theme.gallery.map((image, index) => (
                                <div
                                    key={image}
                                    className="relative w-full h-[240px] sm:h-[360px] md:h-[500px] flex-shrink-0 snap-center cursor-pointer"
                                    onClick={() => {
                                        setActiveIndex(index)
                                        setOpen(true)
                                    }}
                                >
                                    <Image
                                        src={image}
                                        alt={`${theme.title} preview ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>

                        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white text-[#7B3C1D] text-[10px] sm:text-xs px-3 sm:px-4 py-1 rounded-full shadow">
                            Preset Look
                        </span>

                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/50 text-white p-2 sm:p-2.5 rounded-md hover:bg-black/70"
                        >
                            <AiOutlineExpand size={18} />
                        </button>

                        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                            {theme.gallery.map((image, index) => (
                                <button
                                    type="button"
                                    key={`${image}-dot`}
                                    onClick={() => scrollToIndex(index)}
                                    className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full transition ${activeIndex === index ? 'bg-white' : 'bg-white/50'
                                        }`}
                                    aria-label={`Show preview ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {open && (
                        <div
                            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                            onClick={() => setOpen(false)}
                        >
                            <div className="relative w-[92%] h-[92%]">
                                <Image
                                    src={theme.gallery[activeIndex]}
                                    alt={`${theme.title} expanded preview`}
                                    fill
                                    className="object-contain rounded-lg"
                                    unoptimized
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-3 py-4 sm:py-5">
                            <h3 className="text-[#7B3C1D] font-semibold text-sm sm:text-base">
                                Items Included in This Theme
                            </h3>
                            <span className="text-[10px] sm:text-xs text-[#8B5A3C] px-2 py-1 shadow-sm rounded-full">
                                {theme.packageLabel || `${totalItems} items total`}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {theme.items.map((section, index) => {
                                const isOpen = openSections.includes(index)

                                return (
                                    <div
                                        key={section.title}
                                        className="bg-[#00000008] border border-[#DCCBC1] rounded-xl overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleSection(index)}
                                            className="w-full flex items-center justify-between p-4 sm:p-5"
                                        >
                                            <div className="flex items-center gap-3 text-[#7B3C1D] font-medium text-sm sm:text-base">
                                                <FiBox size={18} />
                                                {section.title}
                                            </div>

                                            <FiChevronDown
                                                size={18}
                                                className={`text-[#7B3C1D] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>

                                        <div
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                        >
                                            <div className="px-4 sm:px-5 py-4 sm:py-5 bg-white">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {section.items.map((item) => (
                                                        <div
                                                            key={`${section.title}-${item.name}`}
                                                            className="flex items-center gap-4 border border-[#DCCBC1] rounded-lg p-4"
                                                        >
                                                            <div className="w-10 h-10 rounded bg-[#E8DDD7]" />
                                                            <div>
                                                                <p className="text-sm font-medium text-[#2C1810]">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-[#8B5A3C]">
                                                                    {item.qty}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-[30%] bg-[#EFE7E3] rounded-xl h-fit border border-[#E1E1E1] overflow-hidden">
                    <h4 className="text-center text-sm sm:text-base md:text-lg font-medium text-gray-700 p-4">
                        {theme.packageValueLabel}
                    </h4>

                    <div className="bg-white p-4 space-y-4">
                        <h5 className="text-center text-[#7B3C1D] font-semibold text-lg sm:text-xl md:text-2xl">
                            {theme.priceLabel}
                        </h5>

                        <div className="bg-[#FBF9F7] p-4 text-xs text-gray-600 flex gap-2 font-medium">
                            <span className="text-[#7B3C1D]">
                                <CiCircleInfo size={18} />
                            </span>
                            Final pricing varies based on your customization choices in the Canva.
                        </div>

                        {/* <button
                            type="button"
                            onClick={handleCustomizeClick}
                            className="w-full rounded-md bg-[#A0614D] text-white py-3 font-medium"
                        >
                            Customize in Canva
                        </button> */}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ThemeDetails
