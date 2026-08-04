'use client'

import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'

import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'

import { HiCheck } from 'react-icons/hi'
import { FiLock } from 'react-icons/fi'

import { apiUpdatePassword } from '@/services/AuthProfileService'

// Password validation rules & schema
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[^A-Za-z0-9]/, 'Must include a symbol')

const validationSchema = z
    .object({
        currentPassword: z.string().min(1, 'Password is incorrect'),
        newPassword: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Password does not match',
    })

const ChangePassword = () => {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)

    // Form control & validation
    const {
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(validationSchema),
    })

    const newPassword = watch('newPassword') || ''
    const confirmPassword = watch('confirmPassword') || ''

    // Password validation rules check
    const rules = useMemo(
        () => ({
            length: newPassword.length >= 8,
            number: /\d/.test(newPassword),
            symbol: /[^A-Za-z0-9]/.test(newPassword),
            match:
                newPassword.length > 0 &&
                newPassword === confirmPassword,
        }),
        [newPassword, confirmPassword],
    )

    // Handle password update submission
    const onSubmit = async (values) => {
        try {
            setLoading(true)
            if (!session?.accessToken) return

            const payload = {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
            }

            await apiUpdatePassword(session.accessToken, payload)
            toast.push(
                <Notification title="Password success!" type="success">
                    Password updated successfully
                </Notification>,
            )
            reset()
        } catch (error) {
            console.error('Password update failed:', error)

            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Something went wrong. Please try again.'

            toast.push(
                <Notification title="Password update failed" type="danger">
                    {errorMessage}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    // Password strength progress value calculation
    const progressValue =
        [rules.length, rules.number, rules.symbol].filter(Boolean).length
    const progressPercent = (progressValue / 3) * 100

    return (
        <div className="bg-[#F5F0EE30] md:p-8 p-5 rounded-2xl max-w-7xl mx-auto shadow-md">
            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Form Header */}
                <h4 className="text-lg font-semibold mb-1 flex items-center gap-1">
                    <FiLock size={23} />
                    Change Password
                </h4>
                <p className="text-sm text-gray-500 mb-6">
                    Secure your account with a strong password
                </p>
                <FormItem
                    label="Current Password"
                    invalid={Boolean(errors.currentPassword)}
                    errorMessage={errors.currentPassword?.message}
                >
                    <Controller
                        name="currentPassword"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                autoComplete="off"
                                placeholder="********"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="New Password"
                    invalid={Boolean(errors.newPassword)}
                    errorMessage={errors.newPassword?.message}
                >
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                autoComplete="off"
                                placeholder="********"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="mb-4">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-300 bg-[#1C2C56]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm mb-6">
                    <Rule label="8+ Character" active={rules.length} />
                    <Rule label="Number" active={rules.number} />
                    <Rule label="Symbol" active={rules.symbol} />
                </div>
                <FormItem
                    label="Confirm New Password"
                    invalid={Boolean(errors.confirmPassword)}
                    errorMessage={errors.confirmPassword?.message}
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                autoComplete="off"
                                placeholder="********"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="flex flex-wrap gap-4 text-sm mb-6">
                    <Rule label="Password match" active={rules.match} />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="border px-6 py-2 rounded-md"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={loading || isSubmitting}
                        size="sm"
                        className="bg-[#A0522D] hover:bg-[#8a5a75] px-6 text-white py-2 rounded-md"
                    >
                        Update
                    </Button>
                </div>
            </Form>
        </div>
    )
}

// Rule indicator component
const Rule = ({ label, active }) => (
    <div
        className={`flex items-center gap-2 ${active ? 'text-green-600' : 'text-gray-400'
            }`}
    >
        <HiCheck />
        <span>{label}</span>
    </div>
)

export default ChangePassword
