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

/**
 * Validation schema for the quotation and delivery request form.
 */
const validationSchema = z.object({
    companyName: z.string().min(1, 'Company Name Required'),
    contactPerson: z.string().min(1, 'Contact Person Required'),
    email: z.string().email('Invalid Email'),
    phone: z.string().min(8, 'Phone Required'),
    itemType: z.string().min(1, 'Item Type Required'),
    material: z.string().min(1, 'Material Required'),
    sizeQty: z.string().min(1, 'Size & Quantity Required'),
    deliveryDate: z.date({
        required_error: 'Delivery Date Required',
    }),
    notes: z.string().optional(),
    agree: z.boolean().refine(val => val === true, { message: 'Required' }),
})

/**
 * DeliveryRequestForm Component
 * 
 * Handles user input for custom uniform quotation and delivery date requests.
 */
const DeliveryRequestForm = () => {
    const [dialogTermsOpen, setDialogTermsOpen] = useState(false);
    const [dialoQuoteRequestOpen, setDialogQuoteRequestOpen] = useState(false);

    const {
        handleSubmit,
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
            deliveryDate: null,
            notes: "",
            agree: false,
        },
        resolver: zodResolver(validationSchema),
    });

    /**
     * Handles form submission, formats the delivery date, and opens the quote popup.
     * 
     * @param {Object} values - Validated form field values.
     */
    const onSubmit = (values) => {
        const payload = {
            ...values,
            deliveryDate: values.deliveryDate.toISOString().split('T')[0],
        }
        setDialogQuoteRequestOpen(true);
    };

    return (
        <>
            <div className="w-full bg-white py-8 px-4">
                <div className="w-full mx-auto max-w-[720px]">
                    <h4 className="font-semibold mb-8">
                        Quotation & Delivery Request Form
                    </h4>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        {/* Company & Contact Section */}
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

                        {/* Uniform Specifications Section */}
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
                                            value={field.value}
                                            onChange={(date) => field.onChange(date)}
                                            placeholder="Delivery Date"
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
                                            onClick={() => setDialogTermsOpen(true)}
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