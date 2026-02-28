import { httpClient } from '../http/httpClient';
import type { User } from '../../domain/models/User';
import type { UserRepository, CreateUserDTO } from '../../domain/repositories/UserRepository';

export const userRepository: UserRepository = {
    getUsers: async (): Promise<User[]> => {
        const response = await httpClient.get<User[]>('/users');
        return response.data;
    },

    getUserById: async (id: number): Promise<User> => {
        const response = await httpClient.get<User>(`/users/${id}`);
        return response.data;
    },

    createUser: async (user: CreateUserDTO): Promise<User> => {
        const response = await httpClient.post<User>('/users', user);
        return response.data;
    },
};
