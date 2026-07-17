import { create } from 'zustand'

const initialState = {
    currentView: 'my-profile',
}

export const useSettingsStore = create((set) => ({
    ...initialState,
    setCurrentView: (payload) => set(() => ({ currentView: payload })),
}))
