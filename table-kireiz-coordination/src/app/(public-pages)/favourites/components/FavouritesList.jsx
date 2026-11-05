'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PiHeartThin } from 'react-icons/pi'
import { FiTrash2 } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiGetFavouritesList,
    apiToggleProductFavourite,
    apiToggleThemeFavourite,
} from '@/services/AuthProfileService'
import { apiGetBrowseByColorProductData } from '@/services/ProductService'
import { apiGetBrowseByThemeData } from '@/services/HomeService'

const FavouritesList = () => {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [activeTab, setActiveTab] = useState('all') // 'all' | 'products' | 'themes'
    const [favourites, setFavourites] = useState([])
    const [loading, setLoading] = useState(true)
    const [removingId, setRemovingId] = useState(null)

    const fetchFavourites = useCallback(async () => {
        if (!session?.accessToken) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)

            let fetchedDirectly = false
            try {
                const favRes = await apiGetFavouritesList(session.accessToken)

                // Check if response has data array
                const rawList = Array.isArray(favRes?.data)
                    ? favRes.data
                    : Array.isArray(favRes?.data?.results)
                        ? favRes.data.results
                        : Array.isArray(favRes?.results)
                            ? favRes.results
                            : null

                if (rawList && Array.isArray(rawList)) {
                    const normalized = rawList.map((item) => ({
                        ...item,
                        id: item.id || item.product_id || item.theme_id,
                        favourite_id: item.favourite_id,
                        name: item.name || item.productName || item.title || 'Item',
                        type: (item.type || (item.productName ? 'product' : 'theme')).toLowerCase(),
                        description: item.description || '',
                        image: item.image || item.productImage || item.ProductImage || item.cardImage || '',
                        price: item.price || null,
                        is_favourite: true,
                    }))
                    setFavourites(normalized)
                    fetchedDirectly = true
                }
            } catch {
                fetchedDirectly = false
            }

            // Fallback: If direct endpoint is not available, query products and themes with auth token
            if (!fetchedDirectly) {
                const [productRes, themeRes] = await Promise.allSettled([
                    apiGetBrowseByColorProductData({ page: 1, page_size: 100 }, session.accessToken),
                    apiGetBrowseByThemeData({ page: 1, page_size: 100 }, session.accessToken),
                ])

                const fallbackItems = []

                if (productRes.status === 'fulfilled' && productRes.value?.data) {
                    const prodList = Array.isArray(productRes.value.data)
                        ? productRes.value.data
                        : productRes.value.data?.results || []
                    prodList
                        .filter((p) => p.is_favourite === true)
                        .forEach((p) => {
                            fallbackItems.push({
                                id: p.id,
                                name: p.productName || p.name || 'Product',
                                type: 'product',
                                description: p.description || '',
                                image: p.productImage || p.ProductImage || p.image || '',
                                price: p.price || null,
                                is_favourite: true,
                            })
                        })
                }

                if (themeRes.status === 'fulfilled' && themeRes.value?.data) {
                    const themeList = Array.isArray(themeRes.value.data)
                        ? themeRes.value.data
                        : themeRes.value.data?.results || []
                    themeList
                        .filter((t) => t.is_favourite === true)
                        .forEach((t) => {
                            fallbackItems.push({
                                id: t.id,
                                name: t.title || t.name || 'Theme',
                                type: 'theme',
                                description: t.description || '',
                                image: t.cardImage || t.image || '',
                                price: t.price || null,
                                is_favourite: true,
                            })
                        })
                }

                setFavourites(fallbackItems)
            }
        } catch (error) {
            console.error('Error fetching favourites list:', error)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to load your favorites list.
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }, [session?.accessToken])

    useEffect(() => {
        if (status !== 'loading') {
            fetchFavourites()
        }
    }, [fetchFavourites, status])

    /**
     * Removes an item from the favorites list.
     */
    const handleRemoveFavourite = async (item) => {
        if (!session?.accessToken) return
        const isProduct = item.type === 'product'
        try {
            setRemovingId(item.id)
            if (isProduct) {
                await apiToggleProductFavourite(session.accessToken, item.id)
            } else {
                await apiToggleThemeFavourite(session.accessToken, item.id)
            }
            setFavourites((prev) => prev.filter((fav) => fav.id !== item.id))
            toast.push(
                <Notification title="Updated" type="success">
                    Removed from favorites.
                </Notification>
            )
        } catch (error) {
            console.error('Error removing favorite:', error)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to remove from favorites.
                </Notification>
            )
        } finally {
            setRemovingId(null)
        }
    }

    const productCount = favourites.filter((item) => item.type === 'product').length
    const themeCount = favourites.filter((item) => item.type === 'theme').length

    const displayedItems = favourites.filter((item) => {
        if (activeTab === 'products') return item.type === 'product'
        if (activeTab === 'themes') return item.type === 'theme'
        return true
    })

    // Unauthenticated State
    if (status !== 'loading' && !session?.accessToken) {
        return (
            <section className="w-full bg-white px-3 sm:px-6 md:px-8 lg:px-12 mt-8 sm:mt-12 md:mt-14 py-10">
                <div className="max-w-4xl mx-auto py-12 px-6 bg-[#FBF4F3] rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white border border-[#F3D3C8] flex items-center justify-center mb-4 text-[#A0614D] shadow-xs">
                        <PiHeartThin size={36} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1C2C56] mb-2">
                        Sign in to view your favorites
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm max-w-md mb-6">
                        Save your favorite products and table themes to easily find, customize, and add them to your cart.
                    </p>
                    <Button
                        variant="solid"
                        className="bg-[#A0614D] hover:bg-[#8B4513] text-white px-8 py-2 rounded-lg shadow-xs"
                        onClick={() => router.push('/sign-in')}
                    >
                        Sign In
                    </Button>
                </div>
            </section>
        )
    }

    return (
        <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 mt-8 sm:mt-12 md:mt-14">
            <div className="py-6 sm:py-8 lg:py-10 w-full">
                <div className="bg-[#FBF4F3] rounded-xl p-4 sm:p-6 md:p-8 min-h-[400px] w-full flex flex-col justify-between">
                    <div>
                        {/* Header & Filter Tabs */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F3D3C8]/60">
                            <h2 className="text-lg sm:text-xl font-medium text-gray-900">
                                Items in your Favorites ({displayedItems.length})
                            </h2>

                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('all')}
                                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${activeTab === 'all'
                                            ? 'bg-[#A0614D] text-white shadow-xs'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    All ({favourites.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('products')}
                                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${activeTab === 'products'
                                            ? 'bg-[#A0614D] text-white shadow-xs'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    Products ({productCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('themes')}
                                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${activeTab === 'themes'
                                            ? 'bg-[#A0614D] text-white shadow-xs'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    Themes ({themeCount})
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex justify-center items-center py-16 sm:py-24">
                                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#8B4513]"></div>
                            </div>
                        ) : displayedItems.length === 0 ? (
                            /* Empty State matching CartSummary */
                            <div className="flex flex-col items-center justify-center py-16 sm:py-24">
                                <PiHeartThin size={54} className="text-gray-400 mb-3 sm:mb-4" />
                                <p className="text-gray-600 text-sm sm:text-base font-medium mb-4">
                                    Your favorites list is empty
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-xs sm:text-sm font-medium bg-[#A0614D] text-white rounded-lg hover:bg-[#8B4513] transition shadow-xs"
                                        onClick={() => router.push('/browse-by-color')}
                                    >
                                        Browse Products
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-xs sm:text-sm font-medium bg-white border border-[#A0614D] text-[#A0614D] rounded-lg hover:bg-[#FFF5F1] transition shadow-xs"
                                        onClick={() => router.push('/browse-by-theme')}
                                    >
                                        Browse Themes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Items Row List matching CartSummary */
                            <div className="space-y-4">
                                {displayedItems.map((item) => {
                                    const isProduct = item.type === 'product'

                                    return (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="bg-white rounded-xl p-3.5 sm:p-5 shadow-xs border border-gray-100 transition-all hover:border-[#F3D3C8] w-full"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                {/* Left: Image & Details */}
                                                <div className="flex gap-3.5 sm:gap-5 flex-1 min-w-0 items-center">
                                                    <div className="relative w-20 h-20 sm:w-28 sm:h-24 md:w-32 md:h-24 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                                                        {item.image ? (
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                fill
                                                                className="object-contain p-1.5"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                                No Preview
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0 flex flex-col justify-center pr-2 sm:pr-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-[#FFF5F1] text-[#A0614D] border border-[#F3D3C8]">
                                                                {isProduct ? 'Product' : 'Theme'}
                                                            </span>
                                                        </div>
                                                        <h4
                                                            className="text-base sm:text-lg font-semibold text-gray-800 capitalize mb-1 truncate"
                                                            title={item.name}
                                                        >
                                                            {item.name}
                                                        </h4>
                                                        {item.description && (
                                                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2" title={item.description}>
                                                                {item.description}
                                                            </p>
                                                        )}
                                                        {item.price && (
                                                            <p className="text-xs sm:text-sm font-semibold text-[#8B4513] mt-1">
                                                                Price: ${item.price}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Remove & View Details Buttons */}
                                                <div className="flex items-center justify-end gap-3 pt-3 sm:pt-0 border-t border-gray-100 sm:border-t-0 shrink-0 ml-auto w-full sm:w-auto">
                                                    {/* REMOVE BUTTON */}
                                                    <button
                                                        type="button"
                                                        disabled={removingId === item.id}
                                                        onClick={() => handleRemoveFavourite(item)}
                                                        className="w-[110px] sm:w-[120px] h-[38px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-lg transition shadow-xs whitespace-nowrap disabled:opacity-50"
                                                    >
                                                        {removingId === item.id ? (
                                                            <>
                                                                <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                                                                <span>Removing...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiTrash2 size={14} />
                                                                <span>Remove</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* VIEW DETAILS BUTTON */}
                                                    <button
                                                        type="button"
                                                        className="w-[120px] sm:w-[130px] h-[38px] flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-semibold bg-[#A0614D] hover:bg-[#8B4513] text-white rounded-lg transition shadow-xs whitespace-nowrap"
                                                        onClick={() => {
                                                            if (isProduct) {
                                                                router.push(`/dashboards/uniform-single/${item.id}`)
                                                            } else {
                                                                router.push(`/theme-details?id=${item.id}`)
                                                            }
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FavouritesList
