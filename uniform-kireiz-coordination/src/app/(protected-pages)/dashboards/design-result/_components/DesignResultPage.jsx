'use client'
import { useState } from 'react'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DatePicker from '@/components/ui/DatePicker'
import Image from 'next/image'
import { TbView360Number } from 'react-icons/tb'
const validationSchema = z.object({
    companyName: z.string().min(1, 'Company Name Required'),
    contactPerson: z.string().min(1, 'Contact Person Required'),
    email: z.string().email('Invalid Email'),
    phone: z.string().min(8, 'Phone Required'),
    itemType: z.string().min(1, 'Item Type Required'),
    material: z.string().min(1, 'Material Required'),
    sizeQty: z.string().min(1, 'Size & Quantity Required'),
    deliveryDate: z.string().min(1, 'Delivery Date Required'),
    notes: z.string().optional(),
    agree: z.boolean().refine(val => val === true, { message: 'Required' }),
})
import {
    FiSave,
    FiFileText,
    FiScissors,
    FiTag,
    FiLayers,
    FiArchive,
} from "react-icons/fi"
import { useRouter } from 'next/navigation'

const iconMap = {
    "Cut Style": FiScissors,
    "Collar Type": FiLayers,
    "Sleeve Length": FiTag,
    "Pocket Configuration": FiArchive,
    "Color": FiTag,
    "Fabric": FiLayers,
    "Pant": FiArchive,
}
const DesignResultPage = () => {
    const router = useRouter();
    const [dialogTermsOpen, setDialogTermsOpen] = useState(false);
    const [dialoQuoteRequestOpen, setDialogQuoteRequestOpen] = useState(false);
    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: {
            companyName: "",
            contactPerson: "",
            email: "",
            phone: "",
            itemType: "",
            material: "",
            sizeQty: "",
            deliveryDate: "",
            notes: "",
            agree: false,
        },
        resolver: zodResolver(validationSchema),
    });

    const onSubmit = (values) => {
        console.log('summit from', values);
    };

    const openDialogTerms = () => {
        setDialogTermsOpen(true)
    }
    const openDialogQuoteRequest = () => {
        setDialogQuoteRequestOpen(true)
    }
    const SpecCard = ({ title, value }) => {
        const Icon = iconMap[title]

        return (
            <div className="border border-[#E5E7EB] rounded-xl px-4 py-3 bg-white ">
                <div className="flex items-start gap-2 mb-1">
                    {Icon && <Icon size={16} className="text-gray-400 mt-[2px]" />}
                    <p className="text-xs text-gray-500">{title}</p>
                </div>
                <p className="text-sm font-semibold text-[#1C2C56]">
                    {value}
                </p>
            </div>
        )
    }

    const Counter = () => (
        <div className="flex items-center gap-2">
            <button className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-sm">
                −
            </button>
            <span className="text-sm font-medium">1</span>
            <button className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-sm">
                +
            </button>
        </div>
    )

    const handleRedirect = () => {
        router.push('/dashboards/delivery-request')
    }
    return (
        <>
            <div className="w-full max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl md:p-8 p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* ================= LEFT SECTION ================= */}
                        <div className="flex flex-col items-center lg:border-r lg:border-[#E5E7EB] border-r-none">

                            {/* Header */}
                            <div className="w-full flex justify-between items-center mb-6 px-2 sm:w-[420px]">
                                <p className="text-sm text-gray-600">Design Result</p>
                                <p className="cursor-pointer "><TbView360Number size={23} className="text-gray-600" />
                                </p>
                            </div>

                            {/* Image with Blue Circle */}
                            <div className="relative flex justify-center items-center h-[720px] w-full">
                                <div style={{ position: "absolute", top: "45px" }} className="absolute sm:w-[350px] sm:h-[350px] w-[300px] h-[300px] bg-[#BFE3F9] rounded-full" />

                                <Image style={{ top: "-35px" }}
                                    src="/img/uniform/uniform.png"
                                    alt="Uniform"
                                    width={360}
                                    height={720}
                                    className="relative z-10 object-contain "
                                    priority
                                />
                            </div>
                        </div>

                        {/* ================= RIGHT SECTION ================= */}
                        <div className="flex flex-col">

                            {/* Specification Card */}
                            <div className="bg-white border border-[#E5E7EB] rounded-[16px] overflow-hidden">

                                {/* Header */}
                                <div className="px-5 py-4 bg-[#F7FBFF]">
                                    <h4 className="text-base font-semibold text-[#1C2C56]">
                                        Design Specifications
                                    </h4>
                                </div>

                                {/* Content */}
                                <div className="p-5">

                                    {/* Row 1 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                        <SpecCard title="Cut Style" value="Modern Fit" />
                                        <SpecCard title="Collar Type" value="V-Neck Reinforced" />
                                        <SpecCard title="Sleeve Length" value="Short (Standard)" />
                                    </div>

                                    {/* Row 2 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                        <SpecCard title="Pocket Configuration" value="1 Chest, 2 Lower Patch" />
                                        <SpecCard title="Color" value="Navy Blue" />
                                        <SpecCard title="Fabric" value="Polyester" />
                                    </div>

                                    {/* Row 3 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                        <SpecCard title="Pant" value="Straight Pant" />

                                        {/* Size Range */}
                                        <div className="border border-[#E5E7EB] rounded-xl px-4 py-3 bg-white">
                                            <p className="text-xs text-gray-500 mb-3">Size Range</p>

                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-700">XS</span>
                                                <Counter />
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-700">S</span>
                                                <Counter />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 w-full">

                                {/* Save Design */}
                                <button
                                    className="
      w-full sm:w-auto
      flex-1
      flex flex-col items-center justify-center
      gap-2
      text-xs
      border border-[#E5E7EB]
      rounded-lg
      bg-[#F7FBFF]
      text-[#1C2C56]
      hover:bg-[#EEF5FF]
      transition
      py-2
      h-[55px]
    "
                                >
                                    <FiSave size={18} />
                                    <span>Save Design</span>
                                </button>

                                {/* Export PDF */}
                                <button
                                    className="
      w-full sm:w-auto
      flex-1
      flex flex-col items-center justify-center
      gap-2
      text-xs
      border border-[#E5E7EB]
      rounded-lg
      bg-[#F7FBFF]
      text-[#1C2C56]
      hover:bg-[#EEF5FF]
      transition
      py-2
      h-[55px]
    "
                                >
                                    <FiFileText size={18} />
                                    <span>Export PDF</span>
                                </button>

                                {/* Next (larger on sm+) */}
                                <button
                                    className="
      w-full sm:w-auto
      flex-[2]
      h-[55px]
      bg-[#1C2C56]
      text-white
      px-12
      py-4
      rounded-md
      flex items-center justify-center
    "
                                    onClick={handleRedirect}
                                >
                                    Next
                                </button>
                            </div>


                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default DesignResultPage
