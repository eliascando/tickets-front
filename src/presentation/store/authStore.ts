import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../domain/models/User';

interface AuthState {
    accessToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            user: null,
            isAuthenticated: false,

            login: (token, user) =>
                set({
                    accessToken: token,
                    user,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    accessToken: null,
                    user: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
