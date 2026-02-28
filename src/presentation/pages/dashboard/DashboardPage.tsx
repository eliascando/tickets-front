import { useState, useEffect, useMemo } from 'react';
import { useTicketStore } from '../../store/ticketStore';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import {
    Plus, Search, AlertTriangle, Minus, Equal, Hand,
    CheckCircle2, Trash2, ClipboardList, CalendarDays, Pencil, Play, X, Ban
} from 'lucide-react';
import type { Ticket } from '../../../domain/models/Ticket';

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
    useEffect(() => { const timer = setTimeout(onClose, 3500); return () => clearTimeout(timer); }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border animate-[slideUp_0.3s_ease-out] ${type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/15 border-red-500/30 text-red-300'
            }`}>
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
};

export const DashboardPage = () => {
    const { tickets, isLoading, error, fetchTickets, createTicket, updateTicket, claimTicket, closeTicket, cancelTicket, deleteTicket, clearError } = useTicketStore();
    const { users, fetchUsers } = useUserStore();
    const { user } = useAuthStore();
    const { t } = useTranslation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean; title: string; message: string; confirmLabel: string;
        confirmColor: 'blue' | 'red' | 'emerald' | 'yellow'; icon: React.ReactNode; onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', confirmLabel: '', confirmColor: 'blue', icon: null, onConfirm: () => { } });

    const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high', ownerId: '', dueDate: '' });
    const [editFormData, setEditFormData] = useState({ title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high', status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled', ownerId: '', dueDate: '' });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (user) {
            fetchTickets(filterStatus === 'all' ? undefined : filterStatus);
        }
    }, [user, filterStatus, fetchTickets]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const assignableUsers = useMemo(() => users.filter(u => u.role !== 'admin'), [users]);

    const filteredTickets = tickets.filter((t) => {
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });
    const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setFormError('');
        try {
            await createTicket({ title: formData.title, description: formData.description || undefined, priority: formData.priority, dueDate: formData.dueDate || undefined, createdById: user.id, ownerId: formData.ownerId ? parseInt(formData.ownerId, 10) : undefined });
            setIsModalOpen(false);
            setFormData({ title: '', description: '', priority: 'medium', ownerId: '', dueDate: '' });
            showToast(t('toast.created'), 'success');
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error');
        }
    };

    const openEditModal = (ticket: Ticket) => {
        setEditingTicket(ticket);
        setEditFormData({ title: ticket.title, description: ticket.description || '', priority: ticket.priority, status: ticket.status, ownerId: String(ticket.ownerId), dueDate: ticket.dueDate ? ticket.dueDate.split('T')[0] : '' });
        setFormError(''); setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTicket) return;
        setFormError('');
        try {
            await updateTicket(editingTicket.id, { title: editFormData.title, description: editFormData.description || undefined, priority: editFormData.priority, status: editFormData.status, ownerId: parseInt(editFormData.ownerId, 10), dueDate: editFormData.dueDate || undefined });
            setIsEditModalOpen(false); setEditingTicket(null);
            showToast(t('toast.updated'), 'success');
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error');
        }
    };

    // ── Acciones de confirmación ──

    const confirmClaim = (ticket: Ticket) => setConfirmDialog({
        isOpen: true, title: t('confirm.claimTitle'), message: t('confirm.claimMessage', { title: ticket.title }),
        confirmLabel: t('confirm.claimButton'), confirmColor: 'blue', icon: <Hand size={22} className="text-blue-400" />,
        onConfirm: async () => { try { await claimTicket(ticket.id); showToast(t('toast.claimed'), 'success'); } catch { showToast(t('toast.errorClaim'), 'error'); } closeConfirm(); },
    });

    const confirmStartWorking = (ticket: Ticket) => setConfirmDialog({
        isOpen: true, title: t('confirm.startTitle'), message: t('confirm.startMessage', { title: ticket.title }),
        confirmLabel: t('confirm.startButton'), confirmColor: 'yellow', icon: <Play size={22} className="text-yellow-400" />,
        onConfirm: async () => { try { await claimTicket(ticket.id); showToast(t('toast.started'), 'success'); } catch { showToast(t('toast.errorStart'), 'error'); } closeConfirm(); },
    });

    const confirmClose = (ticket: Ticket) => setConfirmDialog({
        isOpen: true, title: t('confirm.completeTitle'), message: t('confirm.completeMessage', { title: ticket.title }),
        confirmLabel: t('confirm.completeButton'), confirmColor: 'emerald', icon: <CheckCircle2 size={22} className="text-emerald-400" />,
        onConfirm: async () => { try { await closeTicket(ticket.id); showToast(t('toast.completed'), 'success'); } catch { showToast(t('toast.errorComplete'), 'error'); } closeConfirm(); },
    });

    const confirmDelete = (ticket: Ticket) => setConfirmDialog({
        isOpen: true, title: t('confirm.deleteTitle'), message: t('confirm.deleteMessage', { title: ticket.title }),
        confirmLabel: t('confirm.deleteButton'), confirmColor: 'red', icon: <Trash2 size={22} className="text-red-400" />,
        onConfirm: async () => { try { await deleteTicket(ticket.id); showToast(t('toast.deleted'), 'success'); } catch { showToast(t('toast.errorDelete'), 'error'); } closeConfirm(); },
    });

    const confirmCancel = (ticket: Ticket) => setConfirmDialog({
        isOpen: true, title: t('confirm.cancelTaskTitle'), message: t('confirm.cancelTaskMessage', { title: ticket.title }),
        confirmLabel: t('confirm.cancelTaskButton'), confirmColor: 'red', icon: <Ban size={22} className="text-red-400" />,
        onConfirm: async () => { try { await cancelTicket(ticket.id); showToast(t('toast.cancelled'), 'success'); } catch { showToast(t('toast.errorCancel'), 'error'); } closeConfirm(); },
    });

    // ── Helpers ──

    const getUserName = (userId: number | null) => {
        if (!userId) return '—';
        const u = users.find(u => u.id === userId);
        return u ? `${u.name} ${u.lastName?.charAt(0)}.` : `#${userId}`;
    };
    const getUserInitials = (userId: number | null) => {
        if (!userId) return '?';
        const u = users.find(u => u.id === userId);
        return u ? `${u.name.charAt(0)}${u.lastName?.charAt(0) || ''}` : '#';
    };

    const statusConfig: Record<string, { label: string; color: string }> = {
        pending: { label: t('dashboard.statusPending'), color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
        in_progress: { label: t('dashboard.statusInProgress'), color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
        completed: { label: t('dashboard.statusCompleted'), color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
        cancelled: { label: t('dashboard.statusCancelled'), color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    };
    const priorityConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
        high: { label: t('dashboard.priorityHigh'), icon: <AlertTriangle size={14} />, color: 'text-red-400' },
        medium: { label: t('dashboard.priorityMedium'), icon: <Equal size={14} />, color: 'text-yellow-400' },
        low: { label: t('dashboard.priorityLow'), icon: <Minus size={14} />, color: 'text-emerald-400' },
    };

    const filterTabs: { key: FilterStatus; label: string }[] = [
        { key: 'all', label: t('dashboard.filterAll') },
        { key: 'pending', label: t('dashboard.filterPending') },
        { key: 'in_progress', label: t('dashboard.filterInProgress') },
        { key: 'completed', label: t('dashboard.filterCompleted') },
        { key: 'cancelled', label: t('dashboard.filterCancelled') },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('dashboard.greetingMorning');
        if (hour < 18) return t('dashboard.greetingAfternoon');
        return t('dashboard.greetingEvening');
    };

    const isAdmin = user?.role === 'admin';
    const isUserRole = user?.role === 'user';

    // ── Selector de asignado ──
    const AssigneeSelector = ({ value, onChange, allowClear = false }: { value: string; onChange: (val: string) => void; allowClear?: boolean }) => {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [assigneeSearch, setAssigneeSearch] = useState('');
        const selectedUser = assignableUsers.find(u => String(u.id) === value);
        const filtered = assigneeSearch ? assignableUsers.filter(u => `${u.name} ${u.lastName} ${u.username}`.toLowerCase().includes(assigneeSearch.toLowerCase())) : assignableUsers;

        return (
            <div className="relative">
                <button type="button" onClick={() => { setIsDropdownOpen(!isDropdownOpen); setAssigneeSearch(''); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${isDropdownOpen ? 'bg-[var(--bg-input)] border-blue-500 ring-2 ring-blue-500/40' : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:border-blue-500/30'}`}>
                    {selectedUser ? (
                        <>
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                {selectedUser.name.charAt(0)}{selectedUser.lastName?.charAt(0) || ''}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{selectedUser.name} {selectedUser.lastName}</p>
                            </div>
                            {allowClear && (
                                <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); }}
                                    className="p-0.5 rounded text-[var(--text-muted)] hover:text-red-400 transition-colors">
                                    <X size={14} />
                                </button>
                            )}
                        </>
                    ) : (
                        <span className="text-sm text-[var(--text-muted)] flex-1">{t('taskForm.selectMember')}</span>
                    )}
                    <svg className={`w-4 h-4 text-[var(--text-muted)] transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
                        <div className="p-2 border-b border-[var(--border-color)]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                                <input type="text" placeholder={t('taskForm.searchUsers')} value={assigneeSearch}
                                    onChange={(e) => setAssigneeSearch(e.target.value)} autoFocus
                                    className="w-full pl-8 pr-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto py-1">
                            {filtered.length === 0 ? (
                                <p className="text-xs text-[var(--text-muted)] py-4 text-center">{t('taskForm.noUsersFound')}</p>
                            ) : filtered.map((u) => {
                                const selected = value === String(u.id);
                                return (
                                    <button key={u.id} type="button" onClick={() => { onChange(String(u.id)); setIsDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${selected ? 'bg-blue-500/15 text-blue-300' : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selected ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20 text-[var(--text-secondary)]'}`}>
                                            {u.name.charAt(0)}{u.lastName?.charAt(0) || ''}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">{u.name} {u.lastName}</p>
                                            <p className="text-xs text-[var(--text-muted)] truncate">@{u.username}</p>
                                        </div>
                                        {selected && <CheckCircle2 size={14} className="text-blue-400 flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ── Priority Selector ──
    const PrioritySelector = ({ value, onChange }: { value: string; onChange: (val: 'low' | 'medium' | 'high') => void }) => (
        <div className="flex items-center gap-2">
            {([
                { value: 'low' as const, label: t('dashboard.priorityLow'), icon: <Minus size={13} />, activeBg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400', dot: 'bg-emerald-400' },
                { value: 'medium' as const, label: t('dashboard.priorityMedium'), icon: <Equal size={13} />, activeBg: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400', dot: 'bg-yellow-400' },
                { value: 'high' as const, label: t('dashboard.priorityHigh'), icon: <AlertTriangle size={13} />, activeBg: 'bg-red-500/20 border-red-500/50 text-red-400', dot: 'bg-red-400' },
            ]).map((p) => (
                <button key={p.value} type="button" onClick={() => onChange(p.value)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${value === p.value ? p.activeBg : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-blue-500/30'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${value === p.value ? p.dot : 'bg-[var(--border-color)]'}`}></span>
                    {p.icon} {p.label}
                </button>
            ))}
        </div>
    );

    // ── Row Actions ──
    const getRowActions = (ticket: Ticket) => {
        const isOwner = user?.id === ticket.ownerId;
        const isCreator = user?.id === ticket.createdById;
        const actions: React.ReactNode[] = [];

        if (isAdmin) {
            // Admin: Edita solo pendientes, Elimina cualquiera, Cancela pendientes/en_progreso
            if (ticket.status === 'pending') {
                actions.push(
                    <button key="edit" onClick={() => openEditModal(ticket)} title={t('dashboard.edit')} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-blue-500/10 hover:text-blue-400 transition-colors">
                        <Pencil size={16} />
                    </button>
                );
            }
            if (ticket.status === 'pending' || ticket.status === 'in_progress') {
                actions.push(
                    <button key="cancel" onClick={() => confirmCancel(ticket)} title={t('dashboard.cancelTask')} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-yellow-500/10 hover:text-yellow-400 transition-colors">
                        <Ban size={16} />
                    </button>
                );
            }
            actions.push(
                <button key="delete" onClick={() => confirmDelete(ticket)} title={t('dashboard.delete')} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                </button>
            );
        }
        if (isUserRole) {
            if (ticket.status === 'pending') {
                if (!isOwner) actions.push(<button key="claim" onClick={() => confirmClaim(ticket)} title={t('dashboard.claim')} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-blue-500/10 hover:text-blue-400 transition-colors"><Hand size={16} /></button>);
                if (isOwner) actions.push(<button key="start" onClick={() => confirmStartWorking(ticket)} title={t('dashboard.start')} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-yellow-500/10 hover:text-yellow-400 transition-colors"><Play size={16} /></button>);
            }
            if (ticket.status === 'in_progress' && isOwner) {
                actions.push(<button key="complete" onClick={() => confirmClose(ticket)} title={t('dashboard.complete')} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"><CheckCircle2 size={16} /></button>);
            }
            if ((ticket.status === 'pending' || ticket.status === 'in_progress') && (isOwner || isCreator)) {
                actions.push(<button key="cancel" onClick={() => confirmCancel(ticket)} title={t('dashboard.cancelTask')} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"><Ban size={16} /></button>);
            }
        }
        return actions;
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={closeConfirm} onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title} message={confirmDialog.message} confirmLabel={confirmDialog.confirmLabel}
                confirmColor={confirmDialog.confirmColor} icon={confirmDialog.icon} isLoading={isLoading} />

            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        {getGreeting()}, <span className="text-blue-400">{user?.name}</span> 👋
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{t('dashboard.subtitle')}</p>
                </div>
                <button onClick={() => { clearError(); setFormError(''); setIsModalOpen(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-600/20">
                    <Plus size={16} /> {t('dashboard.newTask')}
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {filterTabs.map((tab) => (
                        <button key={tab.key} onClick={() => setFilterStatus(tab.key)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === tab.key
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-blue-500/30'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input type="text" placeholder={t('dashboard.searchPlaceholder')} value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors w-full sm:w-64" />
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* Tabla */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] overflow-x-auto transition-colors">
                <div className="min-w-[1100px]">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        <div className="col-span-4">{t('dashboard.colTaskName')}</div>
                        <div className="col-span-1">{t('dashboard.colStatus')}</div>
                        <div className="col-span-1">{t('dashboard.colPriority')}</div>
                        <div className="col-span-3">{t('dashboard.colAssignedTo')}</div>
                        <div className="col-span-2">{t('dashboard.colCreatedAt')}</div>
                        <div className="col-span-1 text-right">{t('dashboard.colActions')}</div>
                    </div>

                    {isLoading && tickets.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <div className="inline-block w-8 h-8 border-2 border-[var(--border-color)] border-t-blue-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-[var(--text-muted)]">{t('dashboard.loading')}</p>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--bg-input)] rounded-full mb-4">
                                <ClipboardList size={24} className="text-[var(--text-muted)]" />
                            </div>
                            <p className="text-[var(--text-secondary)] font-medium">{t('dashboard.noTasksTitle')}</p>
                            <p className="text-sm text-[var(--text-muted)] mt-1">{searchQuery ? t('dashboard.noTasksSearch') : t('dashboard.noTasksEmpty')}</p>
                            {!searchQuery && (
                                <button onClick={() => { clearError(); setFormError(''); setIsModalOpen(true); }}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all">
                                    <Plus size={14} /> {t('dashboard.createTask')}
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredTickets.map((ticket, index) => {
                            const status = statusConfig[ticket.status] || statusConfig.pending;
                            const priority = priorityConfig[ticket.priority] || priorityConfig.medium;
                            const hasDueDate = ticket.dueDate;
                            const isOverdue = hasDueDate && new Date(ticket.dueDate!) < new Date() && ticket.status !== 'completed';
                            const actions = getRowActions(ticket);

                            return (
                                <div key={ticket.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[var(--bg-hover)] transition-colors ${index < filteredTickets.length - 1 ? 'border-b border-[var(--border-color)]' : ''}`}>
                                    <div className="col-span-4 flex items-start gap-3 min-w-0">
                                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${ticket.priority === 'high' ? 'bg-red-400' : ticket.priority === 'medium' ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{ticket.title}</p>
                                            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{ticket.description || t('dashboard.noDescription')}</p>
                                            {hasDueDate && (
                                                <div className={`flex items-center gap-1 mt-1 text-xs ${isOverdue ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
                                                    <CalendarDays size={11} />
                                                    <span>{isOverdue ? `${t('dashboard.overdue')} · ` : ''}{new Date(ticket.dueDate!).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-1"><span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${status.color}`}>{status.label}</span></div>
                                    <div className="col-span-1 flex items-center"><span className={`inline-flex items-center gap-1 text-xs font-medium ${priority.color}`}>{priority.icon} {priority.label}</span></div>
                                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{getUserInitials(ticket.ownerId)}</div>
                                        <span className="text-sm text-[var(--text-secondary)] truncate">{getUserName(ticket.ownerId)}</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col justify-center min-w-0">
                                        <span className="text-sm text-[var(--text-primary)] truncate">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                        <span className="text-xs text-[var(--text-muted)] truncate">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-end gap-1.5">
                                        {actions.length > 0 ? actions : <span className="text-xs text-[var(--text-muted)] border-dotted border-b border-[var(--border-color)]">_</span>}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {filteredTickets.length > 0 && (
                    <div className="px-6 py-3 border-t border-[var(--border-color)] flex items-center justify-between">
                        <p className="text-xs text-[var(--text-muted)]">
                            {t('dashboard.showing')} <span className="text-[var(--text-secondary)] font-medium">{filteredTickets.length}</span> {t('dashboard.of')}{' '}
                            <span className="text-[var(--text-secondary)] font-medium">{tickets.length}</span> {t('dashboard.tasks')}
                        </p>
                    </div>
                )}
            </div>

            {/* Crear tarea modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('taskForm.createTitle')}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formError && (<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"><AlertTriangle size={14} className="text-red-400 flex-shrink-0" /><p className="text-sm text-red-400">{formError}</p></div>)}

                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)]"><span className="text-red-400">*</span> {t('taskForm.fieldTitle')}</label>
                        <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder={t('taskForm.titlePlaceholder')}
                            className="block w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all sm:text-sm" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)]"><span className="text-red-400">*</span> {t('taskForm.fieldDescription')}</label>
                            <span className="text-xs text-[var(--text-muted)]">{formData.description.length}/500</span>
                        </div>
                        <textarea rows={3} maxLength={500} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t('taskForm.descriptionPlaceholder')}
                            className="block w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all sm:text-sm resize-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">{t('taskForm.fieldPriority')}</label>
                        <PrioritySelector value={formData.priority} onChange={(val) => setFormData({ ...formData, priority: val })} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">{t('taskForm.fieldAssignee')} <span className="text-[var(--text-muted)] font-normal">{t('taskForm.assigneeOptional')}</span></label>
                        <AssigneeSelector value={formData.ownerId} onChange={(val) => setFormData({ ...formData, ownerId: val })} allowClear />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">{t('taskForm.fieldDueDate')} <span className="text-[var(--text-muted)] font-normal">{t('taskForm.assigneeOptional')}</span></label>
                        <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="block w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all sm:text-sm [color-scheme:dark]" />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-[var(--border-color)]">
                        <button type="button" onClick={() => setIsModalOpen(false)}
                            className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg hover:text-[var(--text-primary)] transition-all">{t('taskForm.cancel')}</button>
                        <button type="submit" disabled={isLoading || !formData.title || !formData.description}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25">
                            {isLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> {t('taskForm.saving')}</span> : t('taskForm.save')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Editar tarea modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={t('taskForm.editTitle')}>
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    {formError && (<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"><AlertTriangle size={14} className="text-red-400 flex-shrink-0" /><p className="text-sm text-red-400">{formError}</p></div>)}

                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)]"><span className="text-red-400">*</span> {t('taskForm.fieldTitle')}</label>
                        <input type="text" required value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            className="block w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all sm:text-sm" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)]"><span className="text-red-400">*</span> {t('taskForm.fieldDescription')}</label>
                            <span className="text-xs text-[var(--text-muted)]">{editFormData.description.length}/500</span>
                        </div>
                        <textarea rows={3} maxLength={500} required value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                            className="block w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all sm:text-sm resize-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">{t('dashboard.colStatus')}</label>
                        <div className="flex items-center gap-2">
                            {([
                                { value: 'pending' as const, label: t('dashboard.statusPending'), color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' },
                                { value: 'in_progress' as const, label: t('dashboard.statusInProgress'), color: 'bg-blue-500/20 border-blue-500/50 text-blue-400' },
                                { value: 'completed' as const, label: t('dashboard.statusCompleted'), color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' },
                            ]).map((s) => (
                                <button key={s.value} type="button" onClick={() => setEditFormData({ ...editFormData, status: s.value })}
                                    className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${editFormData.status === s.value ? s.color : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-blue-500/30'}`}>{s.label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">{t('taskForm.fieldPriority')}</label>
                        <PrioritySelector value={editFormData.priority} onChange={(val) => setEditFormData({ ...editFormData, priority: val })} />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)]"><span className="text-red-400">*</span> {t('taskForm.assigneeRequired')}</label>
                        <AssigneeSelector value={editFormData.ownerId} onChange={(val) => setEditFormData({ ...editFormData, ownerId: val })} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">{t('taskForm.fieldDueDate')} <span className="text-[var(--text-muted)] font-normal">{t('taskForm.assigneeOptional')}</span></label>
                        <input type="date" value={editFormData.dueDate} onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                            className="block w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all sm:text-sm [color-scheme:dark]" />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-[var(--border-color)]">
                        <button type="button" onClick={() => setIsEditModalOpen(false)}
                            className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg hover:text-[var(--text-primary)] transition-all">{t('taskForm.cancel')}</button>
                        <button type="submit" disabled={isLoading || !editFormData.title || !editFormData.description || !editFormData.ownerId}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25">
                            {isLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> {t('taskForm.updating')}</span> : t('taskForm.update')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
