import { create } from 'zustand';
import type { User } from '../../domain/models/User';
import type { CreateUserDTO } from '../../domain/repositories/UserRepository';
import { userRepository } from '../../infrastructure/repositories/UserRepositoryImpl';

interface UserState {
    users: User[];
    isLoading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    createUser: (user: CreateUserDTO) => Promise<void>;
    clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    users: [],
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const users = await userRepository.getUsers();
            set({ users, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error al cargar usuarios', isLoading: false });
        }
    },

    createUser: async (userDTO: CreateUserDTO) => {
        set({ isLoading: true, error: null });
        try {
            const newUser = await userRepository.createUser(userDTO);
            set((state) => ({
                users: [newUser, ...state.users],
                isLoading: false,
            }));
        } catch (error: any) {
            const errorMsg = error.response?.data?.message
                ? Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data.message
                : 'Error al crear usuario';
            set({ error: errorMsg, isLoading: false });
            throw error;
        }
    },
}));
