import { create } from 'zustand';

interface ThemeState {
    isDark: boolean;
    toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;

    // Apply on init
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    return {
        isDark,
        toggle: () =>
            set((state) => {
                const next = !state.isDark;
                if (next) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                localStorage.setItem('theme', next ? 'dark' : 'light');
                return { isDark: next };
            }),
    };
});
