export interface User {
    id: number;
    username: string;
    name: string;
    lastName: string;
    isActive: boolean;
    role: 'admin' | 'user';
    createdAt: string;
}
