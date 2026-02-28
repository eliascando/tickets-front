import { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { Modal } from '../../components/ui/Modal';
import { useTranslation } from 'react-i18next';
import { Plus, Shield, User as UserIcon } from 'lucide-react';

export const UsersPage = () => {
    const { users, isLoading, error, fetchUsers, createUser, clearError } = useUserStore();
    const { t } = useTranslation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '', name: '', lastName: '', password: '',
        role: 'user' as 'admin' | 'user',
    });
    const [formError, setFormError] = useState('');

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        try {
            await createUser(formData);
            setIsModalOpen(false);
            setFormData({ username: '', name: '', lastName: '', password: '', role: 'user' });
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error');
        }
    };

    const inputClass = "block w-full px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors sm:text-sm";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('users.title')}</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{t('users.subtitle')}</p>
                </div>
                <button onClick={() => { clearError(); setFormError(''); setIsModalOpen(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                    <Plus size={16} /> {t('users.newUser')}
                </button>
            </div>

            {error && (<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"><p className="text-sm text-red-400">{error}</p></div>)}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading && users.length === 0 ? (
                    <div className="col-span-full text-center text-[var(--text-muted)] py-12">
                        <div className="inline-block w-6 h-6 border-2 border-[var(--border-color)] border-t-blue-500 rounded-full animate-spin mb-3"></div>
                        <p>{t('users.loading')}</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="col-span-full text-center text-[var(--text-muted)] py-12"><p>{t('users.noUsers')}</p></div>
                ) : users.map((u) => (
                    <div key={u.id} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] p-5 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {u.name.charAt(0)}{u.lastName?.charAt(0) || ''}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.name} {u.lastName}</p>
                                <p className="text-xs text-[var(--text-muted)] truncate">@{u.username}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                {u.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                                {u.role === 'admin' ? t('users.roleAdmin') : t('users.roleUser')}
                            </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
                            <span>{t('users.created')} {new Date(u.createdAt).toLocaleDateString()}</span>
                            <span className={`flex items-center gap-1 ${u.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                {u.isActive ? t('users.active') : t('users.inactive')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('users.createTitle')}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {formError && (<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"><p className="text-sm text-red-400">{formError}</p></div>)}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">{t('users.name')}</label>
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">{t('users.lastName')}</label>
                            <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">{t('users.username')}</label>
                        <input type="text" required minLength={3} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder={t('users.minChars3')} className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">{t('users.password')}</label>
                        <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={t('users.minChars6')} className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">{t('users.role')}</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} className={inputClass}>
                            <option value="user">{t('users.roleUser')}</option>
                            <option value="admin">{t('users.roleAdmin')}</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                        <button type="button" onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg hover:text-[var(--text-primary)] transition-colors">{t('users.cancel')}</button>
                        <button type="submit" disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20">
                            {isLoading ? t('users.creating') : t('users.create')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
