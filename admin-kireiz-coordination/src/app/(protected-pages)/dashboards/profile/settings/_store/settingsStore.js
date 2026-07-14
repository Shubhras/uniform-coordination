import { create } from 'zustand'

const initialState = {
    currentView: 'personal-information',
}

export const useSettingsStore = create((set) => ({
    ...initialState,
    setCurrentView: (payload) => set(() => ({ currentView: payload })),
}))
