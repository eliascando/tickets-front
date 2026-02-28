import type { Ticket, CreateTicketDTO, UpdateTicketDTO } from '../models/Ticket';

export interface TicketRepository {
    getTickets(status?: string): Promise<Ticket[]>;
    getTicketById(id: number): Promise<Ticket>;
    createTicket(ticket: CreateTicketDTO): Promise<Ticket>;
    updateTicket(id: number, ticket: UpdateTicketDTO): Promise<Ticket>;
    deleteTicket(id: number): Promise<void>;
    claimTicket(id: number): Promise<Ticket>;
    closeTicket(id: number): Promise<Ticket>;
    cancelTicket(id: number): Promise<Ticket>;
}
