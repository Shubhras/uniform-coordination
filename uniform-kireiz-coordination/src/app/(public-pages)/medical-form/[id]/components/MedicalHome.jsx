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
import { apiCategoryById } from '@/services/CategoryService'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
// import ChatbotSection from '../../chatbot-section/ChatbotSection'
const MedicalHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)
    const { id } = useParams();
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState(filters[0]);
    const [sortBy, setSortBy] = useState(sortOptions[0]);

    useEffect(() => {
        const fetchCategory = async () => {
            setLoading(true);
            try {
                const res = await apiCategoryById(id, activeFilter.id, sortBy.id);
                if (res?.status) {
                    setCategoryData(res.data);
                }
            } catch (err) {
                console.error("Failed to load category detail", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCategory();
    }, [id, activeFilter, sortBy]);
    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }
    console.log(categoryData)

    return (
        <main className="text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <HeroContent />
            <CategorySection 
                data={categoryData || []} 
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />
            <UniformTemplate />
            <ProfessionalSection />
            <ChatbotSection />
            <FooterPage mode={mode} />
        </main>
    )
}

export default MedicalHome
