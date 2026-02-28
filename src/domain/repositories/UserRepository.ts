import type { User } from '../models/User';

export interface CreateUserDTO {
    username: string;
    name: string;
    lastName: string;
    password: string;
    role?: 'admin' | 'user';
}

export interface UserRepository {
    getUsers(): Promise<User[]>;
    getUserById(id: number): Promise<User>;
    createUser(user: CreateUserDTO): Promise<User>;
}
