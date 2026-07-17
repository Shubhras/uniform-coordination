import React, { useState } from 'react'
import Image from 'next/image'
import { FaRegHeart } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'

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

const ThemeCards = () => {
    const [activeFilter, setActiveFilter] = useState('All')
    const router = useRouter()

    const handleCustomizeClick = (themeId) => {
        router.push(`/theme-details?themeId=${themeId}`)
    }

    const filteredCards =
        activeFilter === 'All'
            ? themeCatalog
            : themeCatalog.filter((card) => card.category === activeFilter)

    return (
        <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12">

            {/* ================= FILTER SECTION ================= */}
            <div className="flex gap-3 flex-wrap items-center pt-6">
                <h4 className='text-sm font-medium'>Filters :</h4>
                {themeFilters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
                            px-5 py-2
                            rounded-full
                            text-xs sm:text-sm font-medium
                            transition
                            ${activeFilter === filter
                                ? "bg-[#A0614D] text-white shadow"
                                : " text-[#6B7280] hover:bg-[#ead7c5]"
                            }
                        `}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* ================= DIVIDER ================= */}
            <div className="my-8 border-t-2 border-[#E5D5C8]" />

            {/* ================= CARDS ================= */}
            <div className="overflow-hidden pb-12">
                <div className="grid gap-6 transition-transform duration-500 ease-in-out grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCards.map((item) => (
                        <div
                            key={item.id}
                            className="
                            group
                                relative
                                overflow-hidden
                                shadow-md
                                cursor-pointer
                                w-full
                                p-3
                                rounded-tl-4xl rounded-br-4xl
                                bg-[#F5E9DB]
                                border
                                border-[#D4A6A6]
                                hover:border-[#A0522D]
                                transition
                            "
                        >
                            {/* IMAGE */}
                            <div className="relative w-full h-[300px] overflow-hidden rounded-tl-4xl rounded-br-4xl">
                                <Image
                                    src={item.cardImage}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />

                                {/* BUTTON */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
                                    <button
                                        className="
                                            w-full
                                            py-3
                                            border border-white
                                            text-lg
                                            font-medium
                                            text-white
                                            bg-[#A0614D]
                                            rounded-xl
                                        "
                                        onClick={() => handleCustomizeClick(item.id)}
                                    >
                                        View & Customize This Theme
                                    </button>
                                </div>

                                {/* HEART */}
                                <div className="absolute right-3 top-3">
                                    <FaRegHeart
                                        size={20}
                                        className="text-black group-hover:text-white transition"
                                    />
                                </div>
                            </div>

                            {/* TEXT */}
                            <div className="p-4">
                                <h3 className="text-[#1C2C56] text-[18px] font-semibold">
                                    {item.title}
                                </h3>
                                <p className="text-[#6B7280] text-[14px] mt-2 leading-tight">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    )
}

export default ThemeCards