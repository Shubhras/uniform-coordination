'use client'
import React, { useRef, useState, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { FiBox, FiChevronRight, FiDownload, FiEdit2, FiLock, FiMail } from 'react-icons/fi'
import { HiCheckCircle } from 'react-icons/hi'
import { useSession } from 'next-auth/react'
import { FiFileText } from 'react-icons/fi'
import { apiGetProfile, apiGetQuotation } from '@/services/AuthProfileService'
import { CiUser } from 'react-icons/ci'
import { GoArrowRight } from 'react-icons/go'

const MyProfile = () => {
    const fileRef = useRef(null)
    const { data: session } = useSession()

    const [profile, setProfile] = useState(null)
    const [quotationData, setQuotationData] = useState([])
    const [image, setImage] = useState(null)

    const [profileLoading, setProfileLoading] = useState(true)
    const [quotationLoading, setQuotationLoading] = useState(true)

    /* -------------------- FETCH PROFILE -------------------- */
    const fetchProfile = async () => {
        try {
            if (!session?.accessToken) return

            setProfileLoading(true)
            const res = await apiGetProfile(session.accessToken)

            if (res?.status && res?.data) {
                setProfile(res.data)
                setImage(res.data.profileImage || null)
            }
        } catch (error) {
            console.error('Profile API error:', error)
        } finally {
            setProfileLoading(false)
        }
    }

    /* -------------------- FETCH QUOTATION -------------------- */
    const fetchQuotation = async () => {
        try {
            if (!session?.accessToken) return

            setQuotationLoading(true)
            const res = await apiGetQuotation(session.accessToken)

            if (res?.status) {
                setQuotationData(res.data || [])
            }
        } catch (error) {
            console.error('Quotation API error:', error)
        } finally {
            setQuotationLoading(false)
        }
    }

    useEffect(() => {
        if (!session?.accessToken) return
        fetchProfile()
        fetchQuotation()
    }, [session?.accessToken])

    /* -------------------- IMAGE HANDLERS -------------------- */
    const handleSelectImage = (e) => {
        const file = e.target.files?.[0]
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

    if (profileLoading) {
        return (
            <div className="max-w-7xl mx-auto text-center py-20 text-sm text-gray-500">
                Loading profile...
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* ================= Profile Card ================= */}
            <div className="relative bg-[#F6FAFF] rounded-2xl shadow-md md:p-6 p-2 flex flex-col lg:flex-row gap-6">

                {/* Avatar Column */}
                <div className="flex flex-col items-center lg:items-start">
                    <div className="w-[180px] border border-[#ADC2DE] rounded-2xl flex flex-col items-center gap-3 p-3">
                        <div className="border border-white rounded-full p-1">
                            <Avatar
                                size={110}
                                icon={<CiUser />}
                                src={image}
                                className="shadow-md object-cover"
                            />
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileRef}
                            className="hidden"
                            onChange={handleSelectImage}
                        />
                    </div>

                    <span className="mt-3 flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-3 py-1 rounded-full lg:hidden">
                        <HiCheckCircle size={14} />
                        Verified Account
                    </span>
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col gap-5">
                    <div className="border border-[#ADC2DE] rounded-2xl p-6 bg-[#F7FAFF]">
                        <h4 className="text-sm font-semibold text-[#003562] mb-5">
                            Personal Details
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-10">
                            <div>
                                <p className="text-xs text-gray-500">First Name</p>
                                <p className="text-sm font-medium text-[#0F172A]">
                                    {profile?.firstName || '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Last Name</p>
                                <p className="text-sm font-medium text-[#0F172A]">
                                    {profile?.lastName || '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Email Address</p>
                                <p className="text-sm font-medium flex items-center gap-1 text-[#0F172A]">
                                    {profile?.email || '-'}
                                    <HiCheckCircle className="text-green-500" />
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Phone Number</p>
                                <p className="text-sm font-medium text-[#0F172A]">
                                    {profile?.phone || '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Position</p>
                                <p className="text-sm font-medium text-[#0F172A]">
                                    {profile?.roleName || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="flex items-center gap-2 border border-[#ADC2DE]">
                            <FiEdit2 /> Edit Profile
                        </Button>
                        <Button size="sm" className="flex items-center gap-2 border border-[#ADC2DE]">
                            <FiLock /> Change Password
                        </Button>
                        <Button size="sm" className="flex items-center gap-2 border border-[#ADC2DE]">
                            <FiMail /> Verify Email
                        </Button>
                    </div>
                </div>

                <div className="hidden lg:block">
                    <span className="flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <HiCheckCircle size={14} />
                        Verified Account
                    </span>
                </div>
            </div>

            {/* ================= Quotation Section ================= */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">

                <div className="flex justify-between items-center px-6 py-4 border-b border-[#E2E8F0]">
                    <div>
                        <h4 className="text-sm font-semibold text-[#003562]">
                            Quotation Status
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                            {quotationData?.[0]?.quotationNo || '-'}
                        </p>
                    </div>

                    <Button size="sm" className="bg-[#1C2C56] hover:bg-[#0c2452] text-white">
                        View Design
                    </Button>
                </div>

                <div className="p-6 space-y-3 bg-[#F6FAFF]">
                    {!quotationLoading && quotationData.length === 0 && (
                        <p className="text-xs text-gray-500 text-center">
                            No quotations found
                        </p>
                    )}

                    {quotationData.map((q, i) => (
                        <div
                            key={i}
                            className="flex justify-between items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-4"
                        >
                            <p className="text-sm font-medium text-[#0F172A]">
                                {q.companyName || '-'}
                            </p>

                            <button className="flex items-center gap-2 text-xs text-[#2563A8] font-medium">
                                <FiFileText size={14} />
                                View PDF
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >
                <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">

                    <div className="flex justify-between items-center px-6 py-4 border-b border-[#E2E8F0]">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-[#0F172A]">
                            <FiBox /> Recent Orders
                        </h4>
                        <button className="text-xs text-[#2563A8] font-medium flex items-center gap-1">
                            View All <GoArrowRight />
                        </button>
                    </div>

                    <div className="px-6 py-5 border-b border-[#E2E8F0]">
                        <div className="flex justify-between items-center mb-3 border-b border-[#E2E8F0] pb-2">
                            <div>
                                <p className="text-xs text-gray-500">Order Number</p>
                                <p className="text-sm font-semibold text-[#003560]">
                                    #ORD-10234
                                </p>
                            </div>
                            <span className="text-[11px] bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                Completed
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="text-sm font-medium text-[#0F172A]">
                                    December 2025
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Amount</p>
                                <p className="text-sm font-medium text-[#0F172A]">
                                    ¥454.00
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                size="sm"
                                className="bg-[#1C2C56] hover:bg-[#0c2452] text-white w-full"
                            >
                                View Details
                            </Button>
                            <Button
                                size="sm"
                                variant="default"
                                className="border border-[#1E4FA8]  text-[#1E4FA8] w-full"
                            >
                                Track
                            </Button>
                        </div>
                    </div>

                    <div className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#0F172A] mb-3">
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
                                    className="flex justify-between items-center bg-[#F8FAFC] rounded-lg px-4 py-3 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-md">
                                            <FiFileText size={16} className="text-[#2563A8]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-[#0F172A]">
                                                {item.id}
                                            </p>
                                            <p className="text-[11px] text-gray-500">
                                                {item.sub}
                                            </p>
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-gray-400" />
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-center mt-4 text-[#1C2C56] cursor-pointer">
                            View All Linked Orders
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">

                    <div className="flex justify-between items-center px-6 py-4 border-b border-[#E2E8F0]">
                        <h4 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                            <FiFileText size={16} />
                            Recent Simulations
                        </h4>
                        <button className="text-xs text-[#2563A8] font-medium flex items-center gap-1">
                            View All <GoArrowRight />
                        </button>
                    </div>

                    <div className="px-6 py-4 space-y-4">
                        {[
                            { title: 'Medical & Nursing Care', date: 'Nov 15, 2025', status: 'OPEN' },
                            { title: 'Food Service & Dining', date: 'Nov 18, 2025', status: 'OPEN' },
                            { title: 'Construction & Safety', date: 'Oct 22, 2025', status: 'CLOSED' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <span className="w-3 h-3 rounded-full border border-[#2563A8] mt-1"></span>
                                    <div>
                                        <p className="text-sm font-medium text-[#0F172A]">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {item.date}
                                        </p>
                                        <button className="text-xs text-[#2563A8] flex items-center gap-1 mt-1">
                                            <FiDownload /> PDF Download
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span
                                        className={`text-[11px] px-3 py-1 rounded-md ${item.status === 'OPEN'
                                            ? 'text-[#2563A8] bg-[#DBEAFE]'
                                            : 'text-gray-500 bg-gray-50'
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                    <p className="text-[11px] text-gray-400 mt-2 cursor-pointer">
                                        View Details
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action */}
                    <div className="px-6 py-5 border-t border-[#E2E8F0]">
                        <Button
                            variant="default"
                            className="w-full border border-[#1E3A5F] text-[#1E3A5F] bg-[#F6FAFF]"
                        >
                            Create New Simulation
                        </Button>
                    </div>
                </div>
            </div >
        </div>
    )
}

export default MyProfile
