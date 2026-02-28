import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, LogOut, Code2, Sun, Moon, Globe, Menu, X } from 'lucide-react';

export const MainLayout = () => {
    const { user, logout } = useAuthStore();
    const { isDark, toggle } = useThemeStore();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Cierra el menú móvil al cambiar de ruta
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const toggleLanguage = () => {
        const next = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(next);
        localStorage.setItem('language', next);
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
            ? 'bg-blue-600 text-white'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
        }`;

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex flex-col md:flex-row transition-colors duration-200">
            {/* Barra superior móvil */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--border-color)] sticky top-0 z-30">
                <div className="flex items-center gap-2.5">
                    <div className="bg-blue-600 text-white p-1 rounded">
                        <Code2 size={16} />
                    </div>
                    <span className="text-[var(--text-primary)] font-bold">{t('sidebar.brand')}</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-hover)] rounded-md transition-colors"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Fondo para móvil */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Barra lateral */}
            <aside
                className={`w-64 md:w-56 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
            >
                {/* Marca */}
                <div className="px-5 py-5 border-b border-[var(--border-color)] hidden md:block">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                            <Code2 size={20} />
                        </div>
                        <div>
                            <span className="text-[var(--text-primary)] font-bold text-base">{t('sidebar.brand')}</span>
                            <p className="text-xs text-[var(--text-muted)]">{t('sidebar.tagline')}</p>
                        </div>
                    </div>
                </div>

                {/* Encabezado móvil en la barra lateral */}
                <div className="px-5 py-4 border-b border-[var(--border-color)] md:hidden flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                            <Code2 size={18} />
                        </div>
                        <span className="text-[var(--text-primary)] font-bold text-base">{t('sidebar.brand')}</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-[var(--text-muted)] hover:text-red-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <NavLink to="/" end className={navLinkClass}>
                        <LayoutDashboard size={18} />
                        {t('sidebar.dashboard')}
                    </NavLink>
                    {user?.role === 'admin' && (
                        <NavLink to="/users" className={navLinkClass}>
                            <Users size={18} />
                            {t('sidebar.users')}
                        </NavLink>
                    )}
                </nav>

                {/* Controles: Idioma + Tema */}
                <div className="px-3 pb-2 space-y-1">
                    <button onClick={toggleLanguage}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                        <Globe size={18} />
                        {i18n.language === 'es' ? 'English' : 'Español'}
                    </button>
                    <button onClick={toggle}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        {isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')}
                    </button>
                </div>

                {/* Pie de página de usuario */}
                <div className="p-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user?.name?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name} {user?.lastName}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate capitalize">{user?.role}</p>
                        </div>
                        <button onClick={handleLogout}
                            className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1 flex-shrink-0"
                            title={t('sidebar.logout')}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 md:ml-56 flex flex-col min-w-0 pb-10 md:pb-0 relative">
                <div className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
