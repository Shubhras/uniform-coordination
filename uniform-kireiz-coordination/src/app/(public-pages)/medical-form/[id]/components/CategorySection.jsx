'use client'

import Image from 'next/image'
import { useRouter } from "next/navigation";
import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import Select from '@/components/ui/Select'
import { HiCheck } from 'react-icons/hi'

const CustomOption = (props) => {
    const { innerProps, label, isSelected, isDisabled } = props
    return (
        <div
            className={`flex items-center justify-between px-3 py-2 cursor-pointer ${isSelected ? 'text-[#1C4FA8] bg-[#F2F7FF]' : 'text-[#1C2C56] hover:bg-gray-100'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...innerProps}
        >
            <span className="text-sm font-medium">{label}</span>
            {isSelected && <HiCheck className="text-lg text-[#1C4FA8]" />}
        </div>
    )
}

// const categories = [
//     {
//         title: 'Medical Scrubs',
//         desc: 'Professional, heat-resistant jackets for kitchen safety and comfort',
//         points: [
//             'Classic Double-Breasted | Euro Style | Slim Fit',
//             '12+ Colors | Multiple Sizes',
//             'Heat-Resistant Fabrics | Breathable Cotton',
//         ],
//         img: '/img/medical-form/category/category1.png',
//         btn: 'Customize Jacket',
//     },
//     {
//         title: 'Professional Lab Coats',
//         desc: 'Durable, comfortable pants designed for long hours in the kitchen',
//         points: [
//             'Classic Checkered | Solid Black | Striped',
//             'Elastic Waist | Drawstring | Traditional',
//             'Stain-Resistant | Quick-Drying',
//         ],
//         img: '/img/medical-form/category/category2.png',
//         btn: 'Design Pants',
//     },
//     {
//         title: 'Clinical Staff Wear',
//         desc: 'Protective aprons for chefs and kitchen staff',
//         points: [
//             'Waist Aprons | Bib Aprons | Full Length',
//             'Multiple Colors | Custom Printing',
//             'Water-Resistant | Easy Clean',
//         ],
//         img: '/img/medical-form/category/category3.png',
//         btn: 'View Aprons',
//     },
//     {
//         title: 'Office & Admin Staff',
//         desc: 'Hygienic and professional head coverings',
//         points: [
//             'Chef Hats | Skull Caps | Bandanas',
//             'Disposable Options | Reusable Cotton',
//             'Branding Available',
//         ],
//         img: '/img/medical-form/category/category4.png',
//         btn: 'Explore Headwear',
//     },
// ]

export const filters = [
    { id: '', name: 'All' },
    { id: 'scrub', name: 'Scrub' },
    { id: 'lab-coats', name: 'Lab Coats' },
    { id: 'patient-care', name: 'Patient Care' },
    { id: 'administrative', name: 'Administrative' }
]
export const sortOptions = [
    { id: '', name: 'All' },
    { id: 'popular', name: 'Popular' },
    { id: 'newest', name: 'Newest' },
    // { id: 'price-low-to-high', name: 'Price: Low to High' },
    // { id: 'price-high-to-low', name: 'Price: High to Low' }
]
const CategorySection = ({ subCategoryData, activeFilter, setActiveFilter, sortBy, setSortBy, loading }) => {

    const [openSort, setOpenSort] = useState(false)

    const router = useRouter();

    const handleStartDesigning = (id) => {
        router.push(`/dashboards/uniform-design/${id}`);
    };
    return (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12">
            <div className="space-y-10 mt-10">
                {/* TITLE */}
                <div className=" mb-10">

                    {/* TITLE */}
                    <div className="text-center mb-6">
                        <div className="inline-flex flex-col items-end">
                            <h2 className="text-[#1C2C56] md:text-3xl text-2xl font-semibold">
                                {/* Featured Medical Categories */}
                                Featured Sub Categories
                            </h2>
                            <div className="w-[180px] md:w-[270px] h-[3px] bg-[#87CEEB] mt-2" />
                        </div>
                    </div>

                    {/* FILTER + SORT BAR */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                        {/* FILTERS */}
                        <div className="flex flex-wrap items-center gap-2 border border-[#1C2C56] bg-[#F5F8FF] rounded-lg px-3 py-2">
                            <span className="text-sm text-[#1C2C56] font-medium mr-1">
                                Filters :
                            </span>

                            {filters.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveFilter(item)}
                                    className={`text-sm px-3 py-1 rounded-md transition
                                ${activeFilter.id === item.id
                                            ? 'bg-[#1C2C56] text-white'
                                            : 'text-[#1C2C56] hover:bg-[#1C2C5615]'
                                        }
                            `}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        {/* SORT DROPDOWN */}
                        <div className="relative min-w-[220px] z-[60]">
                            <Select
                                options={sortOptions.map(opt => ({ value: opt.id, label: `${opt.name}` }))}
                                value={{ value: sortBy.id, label: `Sort By : ${sortBy.name}` }}
                                onChange={(selected) => {
                                    const option = sortOptions.find(o => o.id === selected.value);
                                    if (option) setSortBy(option);
                                }}
                                components={{ Option: CustomOption }}
                                styles={{
                                    control: () => ({
                                        borderRadius: '8px',
                                        borderColor: '#1C2C56',
                                        borderStyle: 'solid',
                                        borderWidth: '1px',
                                        backgroundColor: '#F5F8FF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '2px 8px',
                                        cursor: 'pointer',
                                        height: '38px'
                                    }),
                                    singleValue: () => ({ color: '#1C2C56', fontSize: '14px' }),
                                    placeholder: () => ({ color: '#1C2C56', fontSize: '14px' })
                                }}
                            />
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
                    </div>
                ) : subCategoryData?.length > 0 ? (
                    subCategoryData.map((item, index) => {
                        const isReverse = index % 2 !== 0

                        return (
                            <div
                                key={index}
                                className={`
                                    relative
                                    bg-[#E6ECF770]
                                    overflow-hidden
                                    p-4
                                    flex
                                    flex-col-reverse
                                    lg:flex-row
                                    items-center
                                    min-h-[260px]
                                    ${isReverse ? 'lg:flex-row-reverse rounded-tl-[50px]' : 'rounded-tr-[50px]'}
                                `}
                            >
                                {/* TEXT CONTENT */}
                                <div className="w-full lg:w-[40%] px-6 py-6 lg:px-8 lg:py-12 flex flex-col items-center lg:items-start">
                                    <h3 className="text-[#1C2C56] text-xl font-semibold mb-3 capitalize">
                                        {item.name}
                                    </h3>

                                    <p className="text-[#6B7280] text-sm mb-1">
                                        {item.description}
                                    </p>

                                    {/* <ul className="text-[#6B7280] text-sm space-y-1 mb-6">
                                    {item.points.map((point, i) => (
                                        <li key={i}>• {point}</li>
                                    ))}
                                </ul> */}

                                    <button className="mt-5 bg-[#1C4FA8] text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-800" onClick={() => handleStartDesigning(item.id)}>
                                        {/* {item.btn} */}
                                        Customize
                                    </button>
                                </div>

                                {/* IMAGE */}
                                <div className="relative w-full lg:w-[60%] h-[200px] md:h-[260px] lg:h-[300px]">
                                    <Image
                                        // src={item.subcategoryImage}
                                        src={`/img/medical-form/category/category${(index % 3) + 1}.png`}
                                        alt={item.name}
                                        fill
                                        className={`object-contain ${isReverse ? 'lg:object-left' : 'lg:object-right'
                                            } object-center`}
                                        priority
                                        unoptimized
                                    />
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        No categories found.
                    </div>
                )}
            </div>
        </section>
    )
}

export default CategorySection
