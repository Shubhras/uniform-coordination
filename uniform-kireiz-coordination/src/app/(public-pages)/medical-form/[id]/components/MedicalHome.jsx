'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import HeroContent from './HeroContent'
import CategorySection, { filters, sortOptions } from './CategorySection'
import ProfessionalSection from './ProfessionalSection'
import UniformTemplate from './UniformTemplate'
import HaederPage from '../../../header/HaederPage'
import FooterPage from '../../../footer/FooterPage'
import ChatbotSection from '../../../kireiz-form/components/ChatbotSection'
import { apiCategoryById, apiGetTemplateByCategory } from '@/services/CategoryService'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * MedicalHome Component.
 * Main container for the medical uniform category page view.
 * Handles fetching subcategories, templates, filtering, sorting, and theme mode.
 *
 * @returns {JSX.Element} Medical uniform main page layout.
 */
const MedicalHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const { id } = useParams();
    const [categoryData, setCategoryData] = useState([]);
    const [subCategoryData, setSubCategoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState(filters[0]);
    const [sortBy, setSortBy] = useState(sortOptions[0]);

    useEffect(() => {
        /**
         * Fetches templates list associated with the category ID.
         */
        const fetchTemplates = async () => {
            try {
                const res = await apiGetTemplateByCategory(id);
            } catch (err) {
                console.error("Failed to fetch templates", err);
            }
        };
        
        if (id) fetchTemplates();
    }, [id]);

    useEffect(() => {
        /**
         * Fetches subcategory data filtered and sorted by criteria.
         */
        const fetchCategory = async () => {
            setLoading(true);
            try {
                const res = await apiCategoryById(id, activeFilter.id, sortBy.id);
                if (res?.status) {
                    setSubCategoryData(res.data);
                    setCategoryData(res.category);
                }
            } catch (err) {
                console.error("Failed to load category detail", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCategory();
    }, [id, activeFilter, sortBy]);

    /**
     * Toggles theme mode between Light and Dark.
     */
    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <HeroContent categoryData={categoryData || []} />
            <CategorySection
                subCategoryData={subCategoryData || []}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                loading={loading}
            />
            <UniformTemplate />
            <ProfessionalSection />
            <ChatbotSection />
            <FooterPage mode={mode} />
        </main>
    )
}

export default MedicalHome
