import { create } from 'zustand';
import type { Ticket, CreateTicketDTO, UpdateTicketDTO } from '../../domain/models/Ticket';
import { ticketRepository } from '../../infrastructure/repositories/TicketRepositoryImpl';

interface TicketState {
    tickets: Ticket[];
    isLoading: boolean;
    error: string | null;
    fetchTickets: (status?: string) => Promise<void>;
    createTicket: (ticket: CreateTicketDTO) => Promise<void>;
    updateTicket: (id: number, ticket: UpdateTicketDTO) => Promise<void>;
    deleteTicket: (id: number) => Promise<void>;
    claimTicket: (id: number) => Promise<void>;
    closeTicket: (id: number) => Promise<void>;
    cancelTicket: (id: number) => Promise<void>;
    clearError: () => void;
}

export const useTicketStore = create<TicketState>((set) => ({
    tickets: [],
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchTickets: async (status?: string) => {
        set({ isLoading: true, error: null });
        try {
            const tickets = await ticketRepository.getTickets(status);
            set({ tickets, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error al cargar tickets', isLoading: false });
        }
    },

    createTicket: async (ticketDTO: CreateTicketDTO) => {
        set({ isLoading: true, error: null });
        try {
            const newTicket = await ticketRepository.createTicket(ticketDTO);
            set((state) => ({
                tickets: [newTicket, ...state.tickets],
                isLoading: false,
            }));
        } catch (error: any) {
            const errorMsg = error.response?.data?.message
                ? Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data.message
                : 'Error al crear el ticket';
            set({ error: errorMsg, isLoading: false });
            throw error;
        }
    },

    updateTicket: async (id: number, ticketDTO: UpdateTicketDTO) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await ticketRepository.updateTicket(id, ticketDTO);
            set((state) => ({
                tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error al actualizar', isLoading: false });
            throw error;
        }
    },

    deleteTicket: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await ticketRepository.deleteTicket(id);
            set((state) => ({
                tickets: state.tickets.filter((t) => t.id !== id),
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error al eliminar', isLoading: false });
            throw error;
        }
    },

    claimTicket: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await ticketRepository.claimTicket(id);
            set((state) => ({
                tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error al reclamar', isLoading: false });
            throw error;
        }
    },

    closeTicket: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await ticketRepository.closeTicket(id);
            set((state) => ({
                tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error al cerrar', isLoading: false });
            throw error;
        }
    },

    cancelTicket: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await ticketRepository.cancelTicket(id);
            set((state) => ({
                tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error al cancelar', isLoading: false });
            throw error;
        }
    },
}));
