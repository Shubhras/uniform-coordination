'use client'
import React, { useRef, useState, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { FiEdit2, FiLock, FiMail, FiBox } from 'react-icons/fi'
import { HiCheckCircle } from 'react-icons/hi'
import { useSession } from 'next-auth/react'
import {
    FiChevronRight,
    FiFileText,
    FiDownload,
} from 'react-icons/fi'
import { GoArrowRight } from 'react-icons/go'
import { apiGetProfile } from '@/services/AuthProfileService'

const MyProfile = () => {
    const fileRef = useRef(null)
    const { data: session } = useSession()
    const [profile, setProfile] = useState(null)
    const [image, setImage] = useState(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        if (!session?.accessToken) return
        const fetchProfile = async () => {
            try {
                const res = await apiGetProfile(session.accessToken)
                //console.log('resssssssssss', res);
                setProfile(res?.data)
                setImage(res.data.profileImage)
            } catch (error) {
                console.error('Profile API error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [session?.accessToken])
    //console.log('11',session.accessToken)
    const handleSelectImage = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const previewUrl = URL.createObjectURL(file)
        setImage(previewUrl)
    }

    const handleRemoveImage = () => {
        setImage(null)
        if (fileRef.current) {
            fileRef.current.value = ''
        }
    }
    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* ================= Profile Card ================= */}
            <div className="relative bg-[#F5F0EE30] rounded-2xl shadow-md md:p-6 p-2 flex flex-col lg:flex-row gap-6">

                {/* Avatar Column */}
                <div className="flex flex-col items-center lg:items-start">

                    <div className="w-[180px] border border-[#D6B8A6] rounded-2xl flex flex-col items-center gap-3 p-3 bg-[#E0D1C7DB]">

                        {/* Avatar */}
                        <div className="border border-white rounded-full p-1">
                            <Avatar
                                size={110}
                                src={image || 'https://i.pravatar.cc/300'}
                                className="shadow-md object-cover"
                            />
                        </div>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileRef}
                            className="hidden"
                            onChange={handleSelectImage}
                        />

                        {/* Actions */}
                        {/* <div className="flex gap-4 text-xs">
                    <button
                        onClick={() => fileRef.current.click()}
                        className="text-[#A0522D] font-medium hover:underline"
                    >
                        Upload
                    </button>

                    {image && (
                        <button
                            onClick={handleRemoveImage}
                            className="text-red-500 font-medium hover:underline"
                        >
                            Remove
                        </button>
                    )}
                </div> */}
                    </div>

                    {/* ✅ Verified badge – MOBILE */}
                    <span className="mt-3 flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-3 py-1 rounded-full lg:hidden">
                        <HiCheckCircle size={14} />
                        Verified Account
                    </span>
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col gap-5">
                    <div className="border border-[#D6B8A6] rounded-2xl p-6 bg-[#F5F0EE30]">
                        <h4 className="text-sm font-semibold text-[#A0522D] mb-5">
                            Personal Details
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-10">
                            <div>
                                <p className="text-xs text-[#8B6A55]">First Name</p>
                                <p className="text-sm font-medium text-[#5A3E2B]">{profile?.firstName || '-'}</p>
                            </div>

                            <div>
                                <p className="text-xs text-[#8B6A55]">Last Name</p>
                                <p className="text-sm font-medium text-[#5A3E2B]">{profile?.lastName || '-'}</p>
                            </div>

                            <div>
                                <p className="text-xs text-[#8B6A55]">Email Address</p>
                                <p className="text-sm font-medium flex items-center gap-1 text-[#5A3E2B]">
                                    {profile?.email || '-'}
                                    <HiCheckCircle className="text-green-500" />
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-[#8B6A55]">Phone Number</p>
                                <p className="text-sm font-medium text-[#5A3E2B]">
                                    {profile?.phone || '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-[#8B6A55]">Position</p>
                                <p className="text-sm font-medium text-[#5A3E2B]">
                                    {profile?.roleName || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="flex items-center gap-2 border border-[#A0522D] text-[#A0522D]">
                            <FiEdit2 /> Edit Profile
                        </Button>
                        <Button size="sm" className="flex items-center gap-2 border border-[#A0522D] text-[#A0522D]">
                            <FiLock /> Change Password
                        </Button>
                        <Button size="sm" className="flex items-center gap-2 border border-[#A0522D] text-[#A0522D]">
                            <FiMail /> Verify Email
                        </Button>
                    </div>
                </div>

                {/* Verified Badge */}
                <div className="hidden lg:block">
                    <span className="flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <HiCheckCircle size={14} />
                        Verified Account
                    </span>
                </div>
            </div>

            {/* ================= Middle Section ================= */}
            <div className="bg-[#F5F0EE30] rounded-2xl border border-[#D6B8A6] overflow-hidden">

                <div className="flex justify-between items-center px-6 py-4 border-b border-[#D6B8A6]">
                    <div>
                        <h4 className="text-sm font-semibold text-[#A0522D]">
                            Quotation Status
                        </h4>
                        <p className="text-xs text-[#8B6A55] mt-1">
                            RQ-2025-0194 · November 26, 2025
                        </p>
                    </div>

                    <Button
                        size="sm"
                        className="bg-[#A0522D] hover:bg-[#8B4513] text-white"
                    >
                        View Design
                    </Button>
                </div>

                <div className="p-6 space-y-3 bg-[#F5F0EE30]">
                    {['Acme Corp', 'Umbrella Corp', 'Cyberdyne'].map((company, i) => (
                        <div
                            key={i}
                            className="flex justify-between items-center bg-[#E0D1C7DB] border border-[#D6B8A6] rounded-xl px-5 py-4"
                        >
                            <p className="text-sm font-medium text-[#5A3E2B]">
                                {company}
                            </p>

                            <button className="flex items-center gap-2 text-xs text-[#A0522D] font-medium">
                                <FiFileText size={14} />
                                View PDF
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ================= Recent Orders ================= */}
                <div className="bg-[#F5F0EE30] rounded-2xl border border-[#D6B8A6] overflow-hidden">

                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-[#D6B8A6]">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-[#5A3E2B]">
                            <FiBox /> Recent Orders
                        </h4>
                        <button className="text-xs text-[#A0522D] font-medium flex items-center gap-1">
                            View All <GoArrowRight />
                        </button>
                    </div>

                    {/* Order Card */}
                    <div className="px-6 py-5 border-b border-[#D6B8A6]">
                        <div className="flex justify-between items-center mb-3 border-b border-[#D6B8A6] pb-2">
                            <div>
                                <p className="text-xs text-[#8B6A55]">Order Number</p>
                                <p className="text-sm font-semibold text-[#A0522D]">
                                    #ORD-10234
                                </p>
                            </div>
                            <span className="text-[11px] bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                Completed
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-[#8B6A55]">Date</p>
                                <p className="text-sm font-medium text-[#5A3E2B]">
                                    December 2025
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-[#8B6A55]">Total Amount</p>
                                <p className="text-sm font-medium text-[#5A3E2B]">
                                    ¥454.00
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                size="sm"
                                className="bg-[#A0522D] hover:bg-[#8B4513] text-white w-full"
                            >
                                View Details
                            </Button>
                            <Button
                                size="sm"
                                variant="default"
                                className="border border-[#A0522D] text-[#A0522D] w-full"
                            >
                                Track
                            </Button>
                        </div>
                    </div>

                    {/* Linked Orders */}
                    <div className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#5A3E2B] mb-3">
                            Linked Quotes & Orders
                        </p>

                        <div className="space-y-2">
                            {[
                                { id: '#FORM-2024-TPRO', sub: 'Medical Scrubs Bulk' },
                                { id: '#FORM-2024-SFDB', sub: 'Corporate Shirts' },
                                { id: 'Corporate Girl', sub: 'Custom Uniform Set' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center bg-[#E0D1C7DB] rounded-lg px-4 py-3 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-md">
                                            <FiFileText size={16} className="text-[#A0522D]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-[#5A3E2B]">
                                                {item.id}
                                            </p>
                                            <p className="text-[11px] text-[#8B6A55]">
                                                {item.sub}
                                            </p>
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-[#8B6A55]" />
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-center mt-4 text-[#A0522D] cursor-pointer">
                            View All Linked Orders
                        </p>
                    </div>
                </div>

                {/* ================= Recent Simulations ================= */}
                <div className="bg-[#F5F0EE30] rounded-2xl border border-[#D6B8A6] overflow-hidden">

                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-[#D6B8A6]">
                        <h4 className="text-sm font-semibold text-[#5A3E2B] flex items-center gap-2">
                            <FiFileText size={16} />
                            Recent Simulations
                        </h4>
                        <button className="text-xs text-[#A0522D] font-medium flex items-center gap-1">
                            View All <GoArrowRight />
                        </button>
                    </div>

                    {/* List */}
                    <div className="px-6 py-4 space-y-4">
                        {[
                            { title: 'Medical & Nursing Care', date: 'Nov 15, 2025', status: 'OPEN' },
                            { title: 'Food Service & Dining', date: 'Nov 18, 2025', status: 'OPEN' },
                            { title: 'Construction & Safety', date: 'Oct 22, 2025', status: 'CLOSED' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <span className="w-3 h-3 rounded-full border border-[#A0522D] mt-1"></span>
                                    <div>
                                        <p className="text-sm font-medium text-[#5A3E2B]">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-[#8B6A55]">
                                            {item.date}
                                        </p>
                                        <button className="text-xs text-[#A0522D] flex items-center gap-1 mt-1">
                                            <FiDownload /> PDF Download
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span
                                        className={`text-[11px] px-3 py-1 rounded-md ${item.status === 'OPEN'
                                            ? 'text-[#7A3E1D] bg-[#E6D2C4]'
                                            : 'text-[#8B6A55] bg-[#F5F0EE30]'
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                    <p className="text-[11px] text-[#8B6A55] mt-2 cursor-pointer">
                                        View Details
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action */}
                    <div className="px-6 py-5 border-t border-[#D6B8A6]">
                        <Button
                            variant="default"
                            className="w-full border border-[#A0522D] text-[#A0522D] bg-[#F5F0EE30]"
                        >
                            Create New Simulation
                        </Button>
                    </div>
                </div>

            </div>


        </div>


    )
}

export default MyProfile
