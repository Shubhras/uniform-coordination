'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AiOutlineExpand } from 'react-icons/ai'
import { CiCircleInfo } from 'react-icons/ci'
import { FiBox, FiChevronDown, FiChevronLeft } from 'react-icons/fi'
import { apiGetSindleThemeDetails } from '@/services/HomeService'

const themeCatalog = [
    {
        id: 1,
        slug: 'romantic-wedding',
        title: 'Romantic Wedding',
        shortTitle: 'Romantic Wedding',
        description: 'Elegant whites, ivories, and delicate floral accents.',
        category: 'Wedding',
        cardImage: '/img/table-form/themes/theme1.png',
        gallery: [
            '/img/table-form/themes/theme1.png',
            '/img/table-form/blog-image/blog1.png',
            '/img/table-form/blog-image/blog2.png',
        ],
        packageLabel: '14 items total',
        packageValueLabel: 'Estimated Package Value',
        priceLabel: 'Price',
        items: [
            {
                title: 'Table Setup',
                items: [
                    { name: 'Round Table', qty: 'x10' },
                    { name: 'Ivory Tablecloth', qty: 'x10' },
                    { name: 'Gold Charger Plates', qty: 'x80' },
                    { name: 'White Dinner Plates', qty: 'x80' },
                    { name: 'Crystal Glassware', qty: 'x80' },
                    { name: 'Cloth Napkins (Ivory)', qty: 'x80' },
                ],
            },
            {
                title: 'Floral & Decor',
                items: [
                    { name: 'Centerpiece: Soft Rose Arrangement', qty: 'x10' },
                    { name: 'Candle Stands (Gold)', qty: 'x20' },
                    { name: 'Table Numbers (Acrylic)', qty: 'x10' },
                ],
            },
            {
                title: 'Seating',
                items: [
                    { name: 'Chiavari Chairs (Gold)', qty: 'x80' },
                    { name: 'White Chair Cushions', qty: 'x80' },
                ],
            },
            {
                title: 'Additional Elements',
                items: [
                    { name: 'Welcome Sign', qty: 'x1' },
                    { name: 'Menu Cards', qty: 'x80' },
                    { name: 'Place Cards', qty: 'x80' },
                ],
            },
        ],
    },
    {
        id: 2,
        slug: 'olive-chic',
        title: 'Olive Chic',
        shortTitle: 'Olive Chic',
        description: 'Natural olive tones paired with layered greenery and soft neutrals.',
        category: 'Parties',
        cardImage: '/img/table-form/themes/theme2.png',
        gallery: [
            '/img/table-form/themes/theme2.png',
            '/img/table-form/blog-image/blog2.png',
            '/img/table-form/blog-image/blog3.png',
        ],
        packageLabel: '12 items total',
        packageValueLabel: 'Estimated Package Value',
        priceLabel: 'Price',
        items: [
            {
                title: 'Table Setup',
                items: [
                    { name: 'Farmhouse Table', qty: 'x8' },
                    { name: 'Olive Linen Runner', qty: 'x8' },
                    { name: 'Stoneware Plates', qty: 'x64' },
                ],
            },
            {
                title: 'Greenery Styling',
                items: [
                    { name: 'Trailing Olive Garlands', qty: 'x12' },
                    { name: 'Glass Bud Vases', qty: 'x24' },
                    { name: 'Tea Lights', qty: 'x40' },
                ],
            },
            {
                title: 'Guest Seating',
                items: [
                    { name: 'Crossback Chairs', qty: 'x64' },
                    { name: 'Neutral Seat Pads', qty: 'x64' },
                ],
            },
            {
                title: 'Stationery',
                items: [
                    { name: 'Deckled Menu Cards', qty: 'x64' },
                    { name: 'Name Cards', qty: 'x64' },
                ],
            },
        ],
    },
    {
        id: 3,
        slug: 'classy-corporate',
        title: 'Classy Corporate',
        shortTitle: 'Classy Corporate',
        description: 'Sharp styling with structured place settings for polished formal events.',
        category: 'Corporate',
        cardImage: '/img/table-form/themes/theme3.png',
        gallery: [
            '/img/table-form/themes/theme3.png',
            '/img/table-form/blog-image/blog1.png',
            '/img/table-form/blog-image/blog3.png',
        ],
        packageLabel: '10 items total',
        packageValueLabel: 'Estimated Package Value',
        priceLabel: 'Price',
        items: [
            {
                title: 'Conference Tables',
                items: [
                    { name: 'Rectangular Banquet Table', qty: 'x12' },
                    { name: 'Charcoal Linen', qty: 'x12' },
                    { name: 'Acrylic Water Set', qty: 'x96' },
                ],
            },
            {
                title: 'Branding Touchpoints',
                items: [
                    { name: 'Custom Name Placards', qty: 'x96' },
                    { name: 'LED Table Markers', qty: 'x12' },
                ],
            },
            {
                title: 'Seating',
                items: [
                    { name: 'Padded Event Chairs', qty: 'x96' },
                    { name: 'Back Covers', qty: 'x96' },
                ],
            },
            {
                title: 'Presentation Decor',
                items: [
                    { name: 'Low Floral Accent', qty: 'x12' },
                    { name: 'Metal Candle Holders', qty: 'x24' },
                ],
            },
        ],
    },
    {
        id: 4,
        slug: 'festive-blush',
        title: 'Festive Blush',
        shortTitle: 'Festive Blush',
        description: 'Warm blush tones, candlelight, and layered textures for intimate parties.',
        category: 'Seasonal',
        cardImage: '/img/table-form/themes/theme1.png',
        gallery: [
            '/img/table-form/themes/theme1.png',
            '/img/table-form/blog-image/blog2.png',
            '/img/table-form/blog-image/blog1.png',
        ],
        packageLabel: '11 items total',
        packageValueLabel: 'Estimated Package Value',
        priceLabel: 'Price',
        items: [
            {
                title: 'Dining Setup',
                items: [
                    { name: 'Round Table', qty: 'x6' },
                    { name: 'Blush Linen', qty: 'x6' },
                    { name: 'Rose Gold Flatware', qty: 'x48' },
                ],
            },
            {
                title: 'Accent Decor',
                items: [
                    { name: 'Pillar Candles', qty: 'x18' },
                    { name: 'Mini Floral Bowls', qty: 'x12' },
                    { name: 'Velvet Table Runner', qty: 'x6' },
                ],
            },
            {
                title: 'Seating',
                items: [
                    { name: 'Ghost Chairs', qty: 'x48' },
                    { name: 'Blush Cushions', qty: 'x48' },
                ],
            },
        ],
    },
    {
        id: 5,
        slug: 'golden-harvest',
        title: 'Golden Harvest',
        shortTitle: 'Golden Harvest',
        description: 'Seasonal golds and earthy neutrals balanced with warm harvest textures.',
        category: 'Seasonal',
        cardImage: '/img/table-form/themes/theme2.png',
        gallery: [
            '/img/table-form/themes/theme2.png',
            '/img/table-form/blog-image/blog3.png',
            '/img/table-form/blog-image/blog2.png',
        ],
        packageLabel: '13 items total',
        packageValueLabel: 'Estimated Package Value',
        priceLabel: 'Price',
        items: [
            {
                title: 'Table Setup',
                items: [
                    { name: 'Wood Top Table', qty: 'x10' },
                    { name: 'Mustard Linen Runner', qty: 'x10' },
                    { name: 'Amber Glassware', qty: 'x80' },
                ],
            },
            {
                title: 'Harvest Decor',
                items: [
                    { name: 'Dried Floral Arrangement', qty: 'x10' },
                    { name: 'Lantern Set', qty: 'x20' },
                    { name: 'Seasonal Place Mats', qty: 'x80' },
                ],
            },
            {
                title: 'Seating',
                items: [
                    { name: 'Bentwood Chairs', qty: 'x80' },
                    { name: 'Neutral Chair Ties', qty: 'x80' },
                ],
            },
        ],
    },
    {
        id: 6,
        slug: 'midnight-modern',
        title: 'Midnight Modern',
        shortTitle: 'Midnight Modern',
        description: 'Dark luxe textures with crisp metallic details for premium evening events.',
        category: 'Parties',
        cardImage: '/img/table-form/themes/theme3.png',
        gallery: [
            '/img/table-form/themes/theme3.png',
            '/img/table-form/blog-image/blog1.png',
            '/img/table-form/blog-image/blog2.png',
        ],
        packageLabel: '9 items total',
        packageValueLabel: 'Estimated Package Value',
        priceLabel: 'Price',
        items: [
            {
                title: 'Tablescape',
                items: [
                    { name: 'Black Linen', qty: 'x8' },
                    { name: 'Smoked Charger Plates', qty: 'x64' },
                    { name: 'Silver Cutlery Set', qty: 'x64' },
                ],
            },
            {
                title: 'Lighting & Decor',
                items: [
                    { name: 'Mirror Candle Tray', qty: 'x8' },
                    { name: 'Cylinder Vase Set', qty: 'x16' },
                ],
            },
            {
                title: 'Seating',
                items: [
                    { name: 'Black Napoleon Chairs', qty: 'x64' },
                    { name: 'Seat Pads', qty: 'x64' },
                ],
            },
        ],
    },
]

const themeFilters = ['All', 'Wedding', 'Corporate', 'Parties', 'Seasonal']

const getThemeById = (themeIdOrSlug) =>
    themeCatalog.find(
        (theme) =>
            theme.slug === themeIdOrSlug ||
            String(theme.id) === String(themeIdOrSlug),
    ) || themeCatalog[0]

const ThemeDetails = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const scrollRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [open, setOpen] = useState(false)
    const [openSections, setOpenSections] = useState([0])

    const idParam = searchParams.get('id')
    const themeIdParam = searchParams.get('themeId')
    const selectedThemeId = idParam || themeIdParam
    const theme = useMemo(
        () => getThemeById(selectedThemeId),
        [selectedThemeId],
    )

    useEffect(() => {
        console.log('Theme details params:', {
            idParam,
            themeIdParam,
            selectedThemeId,
        })
        console.log('Theme details matched theme:', theme)

        if (selectedThemeId) {
            const fetchSingleTheme = async () => {
                try {
                    const response = await apiGetSindleThemeDetails(selectedThemeId);
                    console.log("apiGetSindleThemeDetails response:", response);
                } catch (error) {
                    console.error("Error fetching single theme details:", error);
                }
            };
            fetchSingleTheme();
        }
    }, [idParam, themeIdParam, selectedThemeId, theme])

    const totalItems = theme.items.reduce(
        (count, section) => count + section.items.length,
        0,
    )

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
        router.push(
            `/dashboards/uniform-3d-design?themeId=${theme.slug}&id=${theme.id}`,
        )
    }

    useEffect(() => {
        setActiveIndex(0)
        setOpen(false)
        setOpenSections([0])
        scrollRef.current?.scrollTo({ left: 0 })
    }, [theme.id])

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
