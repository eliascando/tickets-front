import { httpClient } from '../http/httpClient';
import type { Ticket, CreateTicketDTO, UpdateTicketDTO } from '../../domain/models/Ticket';
import type { TicketRepository } from '../../domain/repositories/TicketRepository';

export const ticketRepository: TicketRepository = {
    getTickets: async (status?: string): Promise<Ticket[]> => {
        const url = status ? `/tasks?status=${status}` : '/tasks';
        const response = await httpClient.get<Ticket[]>(url);
        return response.data;
    },

    getTicketById: async (id: number): Promise<Ticket> => {
        const response = await httpClient.get<Ticket>(`/tasks/${id}`);
        return response.data;
    },

    createTicket: async (ticket: CreateTicketDTO): Promise<Ticket> => {
        const response = await httpClient.post<Ticket>('/tasks', ticket);
        return response.data;
    },

    updateTicket: async (id: number, ticket: UpdateTicketDTO): Promise<Ticket> => {
        const response = await httpClient.put<Ticket>(`/tasks/${id}`, ticket);
        return response.data;
    },

    deleteTicket: async (id: number): Promise<void> => {
        await httpClient.delete(`/tasks/${id}`);
    },

    claimTicket: async (id: number): Promise<Ticket> => {
        const response = await httpClient.patch<Ticket>(`/tasks/${id}/claim`);
        return response.data;
    },

    closeTicket: async (id: number): Promise<Ticket> => {
        const response = await httpClient.patch<Ticket>(`/tasks/${id}/close`);
        return response.data;
    },

    cancelTicket: async (id: number): Promise<Ticket> => {
        const response = await httpClient.patch<Ticket>(`/tasks/${id}/cancel`);
        return response.data;
    },
};
