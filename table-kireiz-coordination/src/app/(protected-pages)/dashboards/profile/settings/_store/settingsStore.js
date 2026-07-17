import { create } from 'zustand'

const initialState = {
    currentView: 'my-profile',
    selectedQuotationId: null,
}

export const useSettingsStore = create((set) => ({
    ...initialState,
    setCurrentView: (payload) => set(() => ({ currentView: payload })),
    setSelectedQuotationId: (payload) =>
        set(() => ({ selectedQuotationId: payload })),
}))
