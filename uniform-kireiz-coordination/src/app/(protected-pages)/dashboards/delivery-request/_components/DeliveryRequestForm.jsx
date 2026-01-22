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
import { apiCreateQuotationRequest } from '@/services/QuotationRequestService'
import { useSession } from 'next-auth/react'

const validationSchema = z.object({
    company_name: z.string().min(1, 'Company Name Required'),
    contact_person: z.string().min(1, 'Contact Person Required'),
    email: z.string().email('Invalid Email'),
    phone_number: z.string().min(8, 'Phone Required'),
    item_type: z.string().min(1, 'Item Type Required'),
    material: z.string().min(1, 'Material Required'),
    size_quantity: z.string().min(1, 'Size & Quantity Required'),
    delivery_date: z.date({
        required_error: 'Delivery Date Required',
    }),
    additional_note: z.string().optional(),
    agreed_to_terms: z.boolean().refine(val => val === true, { message: 'Required' }),
})

const DeliveryRequestForm = () => {
    const [quoteData, setQuoteData] = useState(null)
    const { data: session } = useSession()
    const [dialogTermsOpen, setDialogTermsOpen] = useState(false)
    const [dialoQuoteRequestOpen, setDialogQuoteRequestOpen] = useState(false)

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: {
            company_name: "",
            contact_person: "",
            email: "",
            phone_number: "",
            item_type: "",
            material: "",
            size_quantity: "",
            // delivery_date: null,
            additional_note: "",
            agreed_to_terms: false,
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (values) => {
        const payload = {
            ...values,
            delivery_date: values.delivery_date
                ? values.delivery_date.toISOString().split('T')[0]
                : "",
            customupdatemodel: 7,
        }

        try {
            if (!session?.accessToken) {
                alert("Please login first!")
                return
            }
            const response = await apiCreateQuotationRequest(payload, session.accessToken)
            setQuoteData(response.data)
            setDialogQuoteRequestOpen(true)
        } catch (error) {
            console.error("Error creating quotation request:", error)
            alert("Failed to create quotation request.")
        }
    }

    const openDialogTerms = () => {
        setDialogTermsOpen(true)
    }

    return (
        <>
            <div className="w-full bg-white ">
                <div className="w-full mx-auto max-w-[720px]">
                    <h4 className="font-semibold mb-8">
                        Quotation & Delivery Request Form
                    </h4>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <h5 className="font-medium mb-3">Company & Contact</h5>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                            <FormItem
                                label="Company Name"
                                invalid={Boolean(errors.company_name)}
                                errorMessage={errors.company_name?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="company_name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="Company Name" {...field} />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Contact Person"
                                invalid={Boolean(errors.contact_person)}
                                errorMessage={errors.contact_person?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="contact_person"
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
                                invalid={Boolean(errors.phone_number)}
                                errorMessage={errors.phone_number?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="phone_number"
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
                                invalid={Boolean(errors.item_type)}
                                errorMessage={errors.item_type?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="item_type"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="Item Type" {...field} />
                                    )}
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
                                    render={({ field }) => (
                                        <Input placeholder="Material" {...field} />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Size & Quantity"
                                invalid={Boolean(errors.size_quantity)}
                                errorMessage={errors.size_quantity?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="size_quantity"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="Size & Quantity" {...field} />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Delivery Date"
                                invalid={Boolean(errors.delivery_date)}
                                errorMessage={errors.delivery_date?.message}
                                className="mb-2"
                            >
                                <Controller
                                    name="delivery_date"
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
                            invalid={Boolean(errors.additional_note)}
                            errorMessage={errors.additional_note?.message}
                            className="mb-2"
                        >
                            <Controller
                                name="additional_note"
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        className="input h-24"
                                        placeholder="Additional Note"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            invalid={Boolean(errors.agreed_to_terms)}
                            errorMessage={errors.agreed_to_terms?.message}
                            className="mb-2"
                        >
                            <Controller
                                name="agreed_to_terms"
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
                </div>
            </div>

            <TermsAndConditionsPopup
                isOpen={dialogTermsOpen}
                onClose={() => setDialogTermsOpen(false)}
            />

            {dialoQuoteRequestOpen && (
                <QuoteRequestPopup
                    isOpen={dialoQuoteRequestOpen}
                    onClose={() => setDialogQuoteRequestOpen(false)}
                    quoteData={quoteData}
                />
            )}
        </>
    )
}

export default DeliveryRequestForm
