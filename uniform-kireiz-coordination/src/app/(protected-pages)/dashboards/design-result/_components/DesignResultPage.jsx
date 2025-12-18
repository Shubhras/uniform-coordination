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

const DesignResultPage = () => {
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
    const SpecCard = ({ title, value }) => (
        <div className="border border-[#E3E6EA] rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{title}</p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
        </div>
    )

    const Counter = () => (
        <div className="flex items-center gap-2">
            <button className="w-6 h-6 border border-[#D7DBDF] rounded text-sm">−</button>
            <span className="w-5 text-center text-sm">1</span>
            <button className="w-6 h-6 border border-[#D7DBDF] rounded text-sm">+</button>
        </div>
    )

     const handleRedirect = () => {
        router.push('/dashboards/delivery-request')
    }
    return (
        <>
            <div className="w-full max-w-7xl mx-auto px-4 py-10">
                <div className="bg-white rounded-2xl p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* ================= LEFT SECTION ================= */}
                        <div className="flex flex-col items-center">

                            {/* Header */}
                            <div className="w-full flex justify-between items-center mb-6 px-2">
                                <p className="text-sm text-gray-600">Design Result</p>
                                <p className="text-sm text-gray-600">360°</p>
                            </div>

                            {/* Image with Blue Circle */}
                            <div className="relative flex justify-center items-center h-[520px] w-full">
                                <div className="absolute w-[420px] h-[420px] bg-[#BFE3F9] rounded-full" />

                                <Image
                                    src="/img/uniform/uniform.png"
                                    alt="Uniform"
                                    width={360}
                                    height={720}
                                    className="relative z-10 object-contain"
                                    priority
                                />
                            </div>
                        </div>

                        {/* ================= RIGHT SECTION ================= */}
                        <div className="flex flex-col">

                            {/* Specification Card */}
                            <div className="bg-white border border-[#E3E6EA] rounded-[16px]">
                                <div className='p-4 bg-[#F7FBFF]'>
                                <h4 className="text-base font-semibold text-gray-800 mb-2">
                                    Design Specifications
                                </h4>
                                </div>
                                 <div className='p-4'> 
                                {/* Row 1 */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                    <SpecCard title="Cut Style" value="Modern Fit" />
                                    <SpecCard title="Collar Type" value="V-Neck Reinforced" />
                                    <SpecCard title="Sleeve Length" value="Short (Standard)" />
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                    <SpecCard title="Pocket Configuration" value="1 Chest, 2 Lower Patch" />
                                    <SpecCard title="Color" value="Navy Blue" />
                                    <SpecCard title="Fabric" value="Polyester" />
                                </div>

                                {/* Row 3 */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <SpecCard title="Pant" value="Straight Pant" />

                                    {/* Size Range */}
                                    <div className="border border-[#E3E6EA] rounded-xl px-4 py-3">
                                        <p className="text-xs text-gray-500 mb-3">Size Range</p>

                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm">XS</span>
                                            <Counter />
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">S</span>
                                            <Counter />
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between items-center mt-10">
                                <div className="flex gap-4">
                                    <button className="border border-[#D7DBDF] px-6 py-2 rounded-md text-sm">
                                        Save Design
                                    </button>

                                    <button className="border border-[#D7DBDF] px-6 py-2 rounded-md text-sm">
                                        Export PDF
                                    </button>
                                </div>
                                <button className="bg-[#2F2FA2] text-white px-12 py-2 rounded-md" onClick={() => handleRedirect()}>
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
