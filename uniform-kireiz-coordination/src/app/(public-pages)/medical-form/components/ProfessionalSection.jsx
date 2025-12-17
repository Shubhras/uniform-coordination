'use client'

import { FiCheckCircle } from 'react-icons/fi'

const features = [
    {
        title: 'Antibacterial Fabrics',
        items: [
            'Built-in protection',
            'Easy sterilization',
            'Odor resistance',
            'Long-lasting freshness',
        ],
    },
    {
        title: 'All-Day Comfort',
        items: [
            'Stretch materials',
            'Breathable fabrics',
            'Ergonomic designs',
            'Temperature regulation',
        ],
    },
    {
        title: 'Practical Design',
        items: [
            'Multiple pockets',
            'Easy access',
            'Durable stitching',
            'Professional appearance',
        ],
    },
]

const ProfessionalSection = () => {
    return (
        <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="px-8 py-10 bg-[#E6ECF770] mt-10">

                {/* SECTION TITLE */}
                <h2 className="text-center text-[#1C2C56] lg:text-4xl md:text-3xl text-2xl font-semibold mb-10">
                    Designed for Healthcare Professionals
                </h2>

                {/* FEATURE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="
                                bg-white
                                border
                                border-[#A9BDF5]
                                rounded-xl
                                p-6
                                shadow-sm
                            "
                        >
                            <h3 className="text-[#0A3A78] font-semibold mb-4">
                                {feature.title}
                            </h3>

                            <ul className="space-y-3">
                                {feature.items.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-center gap-2 text-sm text-[#4B5563]"
                                    >
                                        <FiCheckCircle className="text-[#1C4FA8] text-base shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}

export default ProfessionalSection
