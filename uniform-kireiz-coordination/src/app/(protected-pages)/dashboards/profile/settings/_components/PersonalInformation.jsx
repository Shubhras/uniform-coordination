'use client'
import { useMemo, useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Upload from '@/components/ui/Upload'
import Input from '@/components/ui/Input'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import { Form, FormItem } from '@/components/ui/Form'
import NumericInput from '@/components/shared/NumericInput'
import { countryList } from '@/constants/countries.constant'
import { components } from 'react-select'
import { apiGetSettingsProfile } from '@/services/AccontsService'
import sleep from '@/utils/sleep'
import useSWR from 'swr'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { HiOutlineUser } from 'react-icons/hi'
import { TbPlus } from 'react-icons/tb'
import { CiUser } from 'react-icons/ci'
import { apiGetProfile, apiUpdateProfile } from '@/services/AuthProfileService'
import { useSettingsStore } from '../_store/settingsStore'
import { useSession } from 'next-auth/react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
const { Control } = components

const validationSchema = z.object({
    firstName: z.string().min(1, { message: 'First name required' }),
    lastName: z.string().min(1, { message: 'Last name required' }),
    email: z
        .string()
        .min(1, { message: 'Email required' })
        .email({ message: 'Invalid email' }),
    //dialCode: z.string().min(1, { message: 'Please select your country code' }),
    phoneNumber: z
        .string()
        .min(1, { message: 'Please input your mobile number' }),
    position: z.string().min(1, { message: 'Position required' }),
    //img: z.string(),
    img: z.any().optional(),
})

const CustomSelectOption = (props) => {
    return (
        <DefaultOption
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <Avatar
                        shape="circle"
                        size={20}
                        src={`/img/countries/${data.value}.png`}
                    />
                    {props.variant === 'country' && <span>{label}</span>}
                    {props.variant === 'phone' && <span>{data.dialCode}</span>}
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={20}
                    src={`/img/countries/${selected.value}.png`}
                />
            )}
            {children}
        </Control>
    )
}

const PersonalInformation = () => {
    const { data: session } = useSession()
    const { currentView } = useSettingsStore()
    const [loading, setLoading] = useState(false)
    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
    } = useForm({
        resolver: zodResolver(validationSchema),
    })

    // const { data, mutate } = useSWR(
    //     '/api/settings/profile/',
    //     () => apiGetSettingsProfile(),
    //     {
    //         revalidateOnFocus: false,
    //         revalidateIfStale: false,
    //         revalidateOnReconnect: false,
    //     },
    // )

    const dialCodeList = useMemo(() => {
        const newCountryList = JSON.parse(JSON.stringify(countryList))

        return newCountryList.map((country) => {
            country.label = country.dialCode
            return country
        })
    }, [])

    const beforeUpload = (files) => {
        let valid = true

        const allowedFileType = ['image/jpeg', 'image/png']
        if (files) {
            const fileArray = Array.from(files)
            for (const file of fileArray) {
                if (!allowedFileType.includes(file.type)) {
                    valid = 'Please upload a .jpeg or .png file!'
                }
            }
        }

        return valid
    }

    // useEffect(() => {
    //     if (data) {
    //         reset(data)
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [data])
    useEffect(() => {
        if (currentView !== 'personal-information') return

        const fetchProfile = async () => {
            try {
                if (!session?.accessToken) return
                setLoading(true)
                const res = await apiGetProfile(session.accessToken)
                //console.log(res);

                const profile = res?.data
                //console.log(profile);

                // ✅ Map API response to form fields
                reset({
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    email: profile.email || '',
                    position: profile.roleName || '',
                    img: profile.profileImage || '',
                    phoneNumber: profile.phone || '',
                })
            } catch (error) {
                console.error('Failed to fetch profile:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [currentView, reset])
    // const onSubmit = async (values) => {
    //     console.log('Form Data:', values) // <-- log all form data
    //     await sleep(500)
    //     if (data) {
    //         mutate({ ...data, ...values }, false)
    //     }
    // }
    const onSubmit = async (values) => {
        setLoading(true)
        try {
            if (!session?.accessToken) return

            setLoading(true)

            const payload = {
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phoneNumber || null,
                // profileImage: values.img || null,
            }
            if (values.img instanceof File) {
                payload.profileImage = values.img
            }
            //console.log('call',payload);
            await apiUpdateProfile(session.accessToken, payload)
            toast.push(
                <Notification title="Profile success!" type="success">
                    Profile updated successfully
                </Notification>,
            )
            //console.log('Profile updated successfully')

        } catch (error) {
            console.error('Profile update failed:', error)

            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Something went wrong. Please try again.'

            toast.push(
                <Notification title="Profile update failed" type="danger">
                    {errorMessage}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className='bg-[#E8EEF842] p-4 sm:p-5 md:p-8 rounded-2xl max-w-7xl mx-auto shadow-md'>
                <h4 className="text-[#003562] mb-6 sm:mb-8 text-base sm:text-lg font-semibold">Personal information</h4>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-8">
                        <Controller
                            name="img"
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 rounded-lg bg-[#1C4FA81F]">
                                    {/* <Avatar
                                        size={100}
                                        className="border border-white bg-gray-100 text-gray-300 shadow-lg"
                                        icon={<CiUser />}
                                        src={field.value}
                                    /> */}
                                    <Avatar
                                        size={100}
                                        className="border border-white bg-gray-100 text-gray-300 shadow-lg"
                                        icon={<CiUser />}
                                        src={
                                            field.value instanceof File
                                                ? URL.createObjectURL(field.value) // preview new upload
                                                : field.value // show existing URL
                                        }
                                    />
                                    <div className="flex flex-col items-center sm:items-start gap-3 w-full">
                                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                            {/* <Upload
                                                showList={false}
                                                uploadLimit={1}
                                                beforeUpload={beforeUpload}
                                                onChange={(files) => {
                                                    if (files.length > 0) {
                                                        field.onChange(
                                                            URL.createObjectURL(
                                                                files[0],
                                                            ),
                                                        )
                                                    }
                                                }}
                                            > */}
                                            <Upload
                                                showList={false}
                                                uploadLimit={1}
                                                beforeUpload={beforeUpload}
                                                onChange={(files) => {
                                                    if (files.length > 0) {
                                                        field.onChange(files[0]) // store the File object
                                                    } else {
                                                        field.onChange(null)
                                                    }
                                                }}
                                            >
                                                <Button
                                                    variant="solid"
                                                    size="sm"
                                                    type="button"
                                                    // icon={<TbPlus />}
                                                    className=" bg-[#1C2C56] hover:bg-[#1C2C56] text-white py-2 rounded-md px-6 w-full sm:w-auto "
                                                >
                                                    Upload Image
                                                </Button>
                                            </Upload>
                                            <Button
                                                size="sm"
                                                type="button"
                                                className="border px-6 py-2 rounded-md"
                                                onClick={() => {
                                                    field.onChange('')
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <p className='text-[#5175B2] text-center text-xs'>Recommended: 500x500px, JPG/PNG</p>
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormItem
                            label="First name"
                            invalid={Boolean(errors.firstName)}
                            errorMessage={errors.firstName?.message}
                        >
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="First Name"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="Last name"
                            invalid={Boolean(errors.lastName)}
                            errorMessage={errors.lastName?.message}
                        >
                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Last Name"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                    <FormItem
                        label="Email"
                        invalid={Boolean(errors.email)}
                        errorMessage={errors.email?.message}
                    >
                        <Controller
                            name="email"
                            control={control}
                            disabled
                            render={({ field }) => (
                                <Input
                                    type="email"
                                    autoComplete="off"
                                    placeholder="Email"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col sm:flex-row items-end gap-3 w-full">
                            {/* <FormItem
                                className="w-full sm:w-3/4"
                                invalid={Boolean(errors.phoneNumber) || Boolean(errors.dialCode)}
                            >
                                <label className="form-label mb-2">Phone number</label>
                                <Controller
                                    name="dialCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            instanceId="dial-code"
                                            options={dialCodeList}
                                            {...field}
                                            className="w-full border border-gray-300 rounded-md"
                                            components={{
                                                Option: (props) => (
                                                    <CustomSelectOption variant="phone" {...props} />
                                                ),
                                                Control: CustomControl,
                                            }}
                                            value={dialCodeList.filter(
                                                (option) => option.dialCode === field.value
                                            )}
                                            onChange={(option) =>
                                                field.onChange(option?.dialCode)
                                            }
                                        />
                                    )}
                                />
                            </FormItem> */}

                            <FormItem
                                className="w-full"
                                invalid={Boolean(errors.phoneNumber)}
                                errorMessage={errors.phoneNumber?.message}
                            >
                                <label className="form-label mb-2">Phone number</label>
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericInput
                                            placeholder="Phone Number"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <FormItem
                            label="Position"
                            invalid={Boolean(errors.position)}
                            errorMessage={errors.position?.message}
                        >
                            <Controller
                                name="position"
                                control={control}
                                disabled
                                render={({ field }) => (
                                    <Input placeholder="Position" {...field} />
                                )}
                            />
                        </FormItem>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                        <Button
                            variant="default"
                            type="button"
                            size="sm"
                            className="w-full sm:w-auto border px-6 py-2 rounded-md"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            type="submit"
                            size="sm"
                            loading={isSubmitting}
                            className="w-full sm:w-auto bg-[#1C4FA8] hover:bg-[#1C4FA8] px-6 text-white py-2 rounded-md"

                        >
                            Save Changes
                        </Button>
                    </div>
                </Form >
            </div>

        </>
    )
}

export default PersonalInformation
