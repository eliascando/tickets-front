export interface Ticket {
    id: number;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    dueDate?: string;
    createdById: number;
    ownerId: number;
    closedById: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface CreateTicketDTO {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    createdById: number;
    ownerId?: number;
}

export interface UpdateTicketDTO {
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    ownerId?: number;
    closedById?: number;
}
