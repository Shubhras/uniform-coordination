'use client'
import { useState, useEffect } from 'react'
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
import { apiGetModalInfo } from '@/services/SaveDesignService'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
/**
 * Zod validation schema for the delivery/quotation request form.
 * Defines required fields and validation rules for company details,
 * uniform request details, and terms agreement.
 */
const validationSchema = z.object({
    company_name: z
        .string({ required_error: 'Please enter company name' })
        .min(1, { message: 'Please enter company name' }),
    contact_person: z
        .string({ required_error: 'Please enter contact person' })
        .min(1, { message: 'Please enter contact person' }),
    email: z
        .string({ required_error: 'Please enter your email' })
        .min(1, { message: 'Please enter your email' })
        .email({ message: 'Please enter a valid email address' }),
    phone_number: z
        .string({ required_error: 'Please enter phone number' })
        .regex(/^\d+$/, { message: 'Phone number must contain only numbers' })
        .min(8, { message: 'Please enter a valid phone number (min. 8 digits)' }),
    item_type: z
        .string({ required_error: 'Please enter item type' })
        .min(1, { message: 'Please enter item type' }),
    material: z
        .string({ required_error: 'Please enter material' })
        .min(1, { message: 'Please enter material' }),
    size_quantity: z
        .string({ required_error: 'Please enter size and quantity' })
        .min(1, { message: 'Please enter size and quantity' }),
    delivery_date: z.date({
        required_error: 'Please select delivery date',
    }),
    additional_note: z.string().optional(),
    agreed_to_terms: z.boolean().refine(val => val === true, { message: 'Please agree to terms and conditions' }),
})
/**
 * DeliveryRequestForm Component
 *
 * Renders the Quotation & Delivery Request form where users fill in
 * company/contact details and uniform request details. Handles form
 * validation, submission to the quotation request API, and opens the
 * terms & conditions popup and the quote request confirmation popup.
 */
/**
 * Turns the design's size quantities into the one-line string this form asks for,
 * e.g. {XS: 1, S: 2} -> "XS x 1, S x 2". Ordered by size rather than by insertion so
 * the quote reads sensibly.
 */
const formatSizes = (sizes) => {
    if (!sizes) return ""
    return SIZE_ORDER
        .filter((label) => Number(sizes[label]) > 0)
        .map((label) => `${label} x ${sizes[label]}`)
        .join(", ")
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]

const DeliveryRequestForm = () => {
    const [quoteData, setQuoteData] = useState(null)
    const { data: session } = useSession()
    const [dialogTermsOpen, setDialogTermsOpen] = useState(false)
    const [dialoQuoteRequestOpen, setDialogQuoteRequestOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const params = useParams()
    const id = params?.id
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

    /*
     * Prefill from what is already known: the design the shopper just confirmed, and the
     * account they are signed in with.
     *
     * These fields started blank, which meant retyping details the system already held —
     * and worse, the quote could end up describing something other than the design it is
     * attached to. Everything stays editable; this only sets the starting values.
     *
     * Company Name is left blank on purpose: the customer record has no company field, so
     * there is nothing to prefill it from.
     */
    useEffect(() => {
        let cancelled = false

        const prefill = async () => {
            if (!id || !session?.accessToken) return

            let design = null
            try {
                const res = await apiGetModalInfo(id, session.accessToken)
                design = res?.data || (res?.status ? res : null)
            } catch (err) {
                // A failed lookup just means no prefill — the form still works.
                console.error("Could not load the design for prefill:", err)
            }
            if (cancelled) return

            const config = design?.config_json || {}

            reset((prev) => ({
                ...prev,
                contact_person: prev.contact_person || session?.user?.name || "",
                email: prev.email || session?.user?.email || "",
                item_type: prev.item_type || design?.productName || "",
                material: prev.material || config.fabric || "",
                size_quantity: prev.size_quantity || formatSizes(config.sizes),
            }))
        }

        prefill()
        return () => {
            cancelled = true
        }
    }, [id, session?.accessToken, session?.user?.name, session?.user?.email, reset])
    /**
        * Handles form submission. Builds the payload, checks for a valid
        * session, calls the create quotation request API, and opens the
        * quote request popup with the response data.
        */
    const onSubmit = async (values) => {
        const payload = {
            ...values,
            delivery_date: values.delivery_date
                ? values.delivery_date.toISOString().split('T')[0]
                : "",
            customupdatemodel_id: id,
        }
        try {
            if (!session?.accessToken) {
                alert("Please login first!")
                return
            }
            setIsSubmitting(true)
            const response = await apiCreateQuotationRequest(payload, session.accessToken)
            setQuoteData(response.data)
            setDialogQuoteRequestOpen(true)
        } catch (error) {
            console.error("Error creating quotation request:", error)
            alert("Failed to create quotation request.")
        } finally {
            setIsSubmitting(false)
        }
    }
    /**
         * Opens the terms and conditions popup.
         */
    const openDialogTerms = () => {
        setDialogTermsOpen(true)
    }
    return (
        <>
            <div className="w-full bg-white ">
                <div className="w-full mx-auto max-w-[720px]">
                    <h4 className="font-semibold mb-8 text-[#003562]">
                        Quotation & Delivery Request Form
                    </h4>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <h5 className="font-medium mb-3">Company & Contact</h5>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                            <FormItem
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
                                            minDate={new Date()}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <FormItem
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
                                            className="text-[#87CEEB] cursor-pointer ml-2"
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
                            loading={isSubmitting}
                            className="w-full mt-4 bg-[#1C4FA8] hover:bg-[#1C4FA8] text-white py-3"
                        >
                            Request a Quote
                        </Button>
                    </Form>
                </div>
            </div>
            {/* Terms and conditions popup */}
            <TermsAndConditionsPopup
                isOpen={dialogTermsOpen}
                onClose={() => setDialogTermsOpen(false)}
            />
            {/* Quote request confirmation popup, shown after successful submission */}
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
