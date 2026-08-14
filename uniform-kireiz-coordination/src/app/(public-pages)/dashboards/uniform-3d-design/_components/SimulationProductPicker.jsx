'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiGetSimulationOptions } from '@/services/SimulationService'
import { apiGetTemplateById } from '@/services/CategoryService'

/*
 * Landing screen for /dashboards/uniform-3d-design with no product in the URL.
 *
 * Previously this route rendered the customiser itself, which had no product to work
 * with — it hung on its loading state and showed a fixed placeholder garment.
 *
 * The list comes from the customer simulation endpoint, so it holds exactly the products
 * the admin enabled under Admin -> Simulation Assets -> Product Visibility. Picking one
 * hands off to /dashboards/uniform-3d-design/<id>, which is the flow that already works.
 */

const SimulationProductPicker = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Arriving from a template: ?category=<id>&template=<id>. The template is a style, so
  // it travels with the shopper until a product is chosen and then gets applied there.
  const templateId = searchParams.get('template')
  const categoryFromUrl = searchParams.get('category')

  const [products, setProducts] = useState([])
  const [template, setTemplate] = useState(null)
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        const res = await apiGetSimulationOptions()
        if (cancelled) return

        if (res?.status) {
          setProducts(res.data?.products || [])
        } else {
          setFailed(true)
        }
      } catch (err) {
        console.error('Failed to load simulatable products:', err)
        if (!cancelled) setFailed(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadTemplate = async () => {
      if (!templateId) return
      try {
        const res = await apiGetTemplateById(templateId)
        if (!cancelled && res?.status) setTemplate(res.data)
      } catch (err) {
        // Losing the template only costs the banner and the preset; the picker still works.
        console.error('Failed to load the template:', err)
      }
    }

    loadTemplate()
    return () => {
      cancelled = true
    }
  }, [templateId])

  // Narrow to the template's category so the shopper only sees uniforms it applies to.
  useEffect(() => {
    if (!categoryFromUrl || products.length === 0) return
    const match = products.find(
      (p) => String(p.category_id) === String(categoryFromUrl),
    )
    if (match?.category) setCategory(match.category)
  }, [categoryFromUrl, products])

  // Built from the products actually on offer, so the filter can never point at a
  // category with nothing behind it.
  const categories = useMemo(() => {
    const seen = new Map()
    products.forEach((p) => {
      if (p.category) seen.set(p.category, (seen.get(p.category) || 0) + 1)
    })
    return [...seen.entries()].map(([name, count]) => ({ name, count }))
  }, [products])

  const visible = category
    ? products.filter((p) => p.category === category)
    : products

  const open = (id) =>
    router.push(
      templateId
        ? `/dashboards/uniform-3d-design/${id}?template=${templateId}`
        : `/dashboards/uniform-3d-design/${id}`,
    )

  return (
    <section className="w-full bg-white px-5 md:px-8 lg:px-12 py-8 mt-11">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#1C2C56]">
            Choose a uniform to customise
          </h1>
          <div className="w-20 h-1 bg-[#1C2C56] mx-auto mt-2 rounded-full" />
          <p className="text-sm text-[#6B7280] mt-3">
            {template
              ? 'Pick the uniform you want this style applied to.'
              : 'Pick a uniform to open it in the design tool.'}
          </p>
        </div>

        {template && (
          <div className="mt-6 max-w-2xl mx-auto border border-[#C7D7F5] bg-[#F5F8FF] rounded-xl px-4 py-3 flex items-center gap-3">
            {template.templateImage && (
              <span className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                <Image
                  src={template.templateImage}
                  alt={template.templateName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[#1C2C56] truncate">
                Using template: {template.templateName}
              </span>
              <span className="block text-xs text-[#64748B] truncate">
                {[
                  template.presetColorName && `Colour: ${template.presetColorName}`,
                  template.presetFabricName && `Fabric: ${template.presetFabricName}`,
                ]
                  .filter(Boolean)
                  .join(' • ') || 'No preset style on this template'}
              </span>
            </span>
          </div>
        )}

        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${!category
                ? 'bg-[#1C4FA8] text-white border-[#1C4FA8]'
                : 'border-[#CBD5E1] text-[#486284] hover:border-[#1C4FA8]'
                }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setCategory(c.name)}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${category === c.name
                  ? 'bg-[#1C4FA8] text-white border-[#1C4FA8]'
                  : 'border-[#CBD5E1] text-[#486284] hover:border-[#1C4FA8]'
                  }`}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-[#E2E8F0] rounded-2xl h-[320px] animate-pulse bg-[#F5F8FF]"
              />
            ))}
          </div>
        )}

        {!loading && failed && (
          <p className="text-center text-sm text-red-600 mt-12">
            We could not load the uniforms. Please try again.
          </p>
        )}

        {!loading && !failed && visible.length === 0 && (
          <div className="border border-dashed border-[#CBD5E1] rounded-xl py-16 text-center mt-8">
            <p className="text-base font-medium text-[#1C2C56]">
              No uniforms are available to customise yet
            </p>
            <p className="text-sm text-[#6B7280] mt-1">
              Please check back soon.
            </p>
          </div>
        )}

        {!loading && !failed && visible.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {visible.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-[#1C2C56] rounded-2xl p-4 flex flex-col justify-between"
              >
                <div className="relative w-full h-[200px] flex items-center justify-center mb-4">
                  <Image
                    src={p.image || '/img/uniform/uniform.png'}
                    alt={p.name}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-[#1C2C56] font-medium truncate" title={p.name}>
                    {p.name}
                  </h4>
                  <p className="text-xs text-[#6B7280] truncate">
                    {p.category || '—'}
                    {p.subcategory ? ` • ${p.subcategory}` : ''}
                  </p>

                  <button
                    type="button"
                    onClick={() => open(p.id)}
                    className="bg-[#1C4FA8] text-white text-sm py-2 rounded-md mt-1"
                  >
                    Customize
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default SimulationProductPicker
