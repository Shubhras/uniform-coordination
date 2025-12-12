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
import TermsAndConditionsPopup from './TermsAndConditionsPopup'
import QuoteRequestPopup from './QuoteRequestPopup'
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

const DeliveryRequestForm = () => {
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
    return (
        <>
            <div className="w-full bg-white flex flex-col lg:flex-row px-6 lg:px-16 py-4 gap-10">
                <div className="w-full lg:w-1/2 px-4 ">
                    <h5 className="font-medium mb-3">Design Result</h5>
                    <div className="relative w-[250px] h-[250px] mx-auto">
                        <div className="absolute inset-0 rounded-full bg-[#BEE3F8]"></div>
                        <img
                            src="/img/uniform/uniform.png"
                            alt="Model"
                            className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] object-contain"
                        />
                    </div>
                    <div className="mt-40 border border-gray-300 rounded-lg w-[350px] mx-auto">
                        <div className="grid grid-cols-2 text-sm relative">
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200"></div>
                            <div className="flex flex-col gap-4 p-6">
                                <span className="font-medium">Collar</span>
                                <span className="font-medium">Color</span>
                                <span className="font-medium">Material</span>
                                <span className="font-medium">Sleeve</span>
                                <span className="font-medium">Pants Color</span>
                            </div>
                            <div className="flex flex-col gap-4 p-6">
                                <span>Stand</span>
                                <span>White</span>
                                <span>100% Polyester</span>
                                <span>Full</span>
                                <span>Navy</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2">
                    <h4 className="font-semibold mb-4">
                        Quotation & Delivery Request Form
                    </h4>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <h5 className="font-medium mb-3">Company & Contact</h5>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                            <FormItem
                                label="Company Name"
                                invalid={Boolean(errors.companyName)}
                                errorMessage={errors.companyName?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="companyName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="Company Name" {...field} />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                label="Contact Person"
                                invalid={Boolean(errors.contactPerson)}
                                errorMessage={errors.contactPerson?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="contactPerson"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="Contact Person" {...field} />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                label="Email Address"
                                invalid={Boolean(errors.email)}
                                errorMessage={errors.email?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Input type="email" placeholder="Email Address" {...field} />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                label="Phone Number"
                                invalid={Boolean(errors.phone)}
                                errorMessage={errors.phone?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="Phone Number" {...field} />
                                    )}
                                />
                            </FormItem>
                        </div>
                        <h5 className="font-medium mb-3">Uniform Request Details</h5>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                            <FormItem
                                label="Item Type"
                                invalid={Boolean(errors.itemType)}
                                errorMessage={errors.itemType?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="itemType"
                                    control={control}
                                    render={({ field }) => <Input placeholder="Item Type" {...field} />}
                                />
                            </FormItem>
                            <FormItem
                                label="Material"
                                invalid={Boolean(errors.material)}
                                errorMessage={errors.material?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="material"
                                    control={control}
                                    render={({ field }) => <Input placeholder="Material" {...field} />}
                                />
                            </FormItem>
                            <FormItem
                                label="Size & Quantity"
                                invalid={Boolean(errors.sizeQty)}
                                errorMessage={errors.sizeQty?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="sizeQty"
                                    control={control}
                                    render={({ field }) => <Input placeholder="Size & Quantity" {...field} />}
                                />
                            </FormItem>
                            <FormItem
                                label="Delivery Date"
                                invalid={Boolean(errors.deliveryDate)}
                                errorMessage={errors.deliveryDate?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="deliveryDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            value={field.value}
                                            onChange={(date) => field.onChange(date)}
                                            placeholder="Pick a date"
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                        <FormItem
                            label="Additional Note"
                            invalid={Boolean(errors.notes)}
                            errorMessage={errors.notes?.message}
                            className="mb-2"
                        >
                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <textarea className="input h-24" placeholder="Additional Note" {...field} />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            invalid={Boolean(errors.agree)}
                            errorMessage={errors.agree?.message}
                            className="mb-2"
                        >
                            <Controller
                                name="agree"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox {...field}>
                                        I agree to privacy
                                        <span
                                            className="text-blue-500 cursor-pointer ml-2"
                                            onClick={openDialogTerms} 
                                        >
                                            policy & terms
                                        </span>
                                    </Checkbox>
                                )}
                            />
                        </FormItem>
                        <Button
                            type="submit"
                            variant="solid"
                            className="w-full mt-4 bg-[#1C2C56] hover:bg-[#1C2C56] text-white py-3"
                        >
                            Request a Quote
                        </Button>
                    </Form>
                    <div className="flex justify-center gap-4 mt-6">
                        <button className="border px-6 py-2 rounded-md">Save Design</button>
                        <button className="border px-6 py-2 rounded-md" onClick={openDialogQuoteRequest}>Export PDF</button>
                    </div>
                </div>
            </div>
            <TermsAndConditionsPopup
                isOpen={dialogTermsOpen}
                onClose={() => setDialogTermsOpen(false)}
            />
            <QuoteRequestPopup
                isOpen={dialoQuoteRequestOpen}
                onClose={() => setDialogQuoteRequestOpen(false)}
            />

        </>

    )
}

export default DeliveryRequestForm
