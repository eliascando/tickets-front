import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { httpClient } from '../../../infrastructure/http/httpClient';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Lock, Eye, EyeOff, LogIn, AlertTriangle, Sun, Moon, Globe } from 'lucide-react';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuthStore();
    const { isDark, toggle } = useThemeStore();
    const { t, i18n } = useTranslation();

    // Prevent logged-in users from accessing the login page
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const toggleLanguage = () => {
        const next = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(next);
        localStorage.setItem('language', next);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await httpClient.post('/auth/login', { username, password });
            const { accessToken, user } = response.data;

            login(accessToken, user || {
                id: 0, username, role: username === 'admin' ? 'admin' : 'user',
                name: 'Usuario', lastName: '', isActive: true, createdAt: new Date().toISOString()
            });
            navigate('/', { replace: true });
        } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 400) {
                setError(t('login.errorInvalid'));
            } else {
                setError(t('login.errorGeneric'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4 transition-colors duration-200">
            {/* Controles superiores derechos: Idioma + Tema */}
            <div className="absolute top-5 right-5 flex items-center gap-2">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors"
                >
                    <Globe size={14} />
                    {i18n.language === 'es' ? 'EN' : 'ES'}
                </button>
                <button
                    onClick={toggle}
                    className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </div>

            {/* Resplandor de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
                        <span className="text-white font-bold text-lg">&lt;/&gt;</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('login.title')}</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{t('login.subtitle')}</p>
                </div>

                {/* Tarjeta de inicio de sesión */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-8 shadow-2xl transition-colors duration-200" style={{ boxShadow: '0 25px 50px -12px var(--shadow-color)' }}>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{t('login.heading')}</h2>
                    <p className="text-sm text-[var(--text-muted)] mb-6">{t('login.description')}</p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                                <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="username" className="text-sm font-medium text-[var(--text-secondary)]">{t('login.username')}</label>
                            <div className="relative">
                                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input id="username" type="text" required value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t('login.usernamePlaceholder')}
                                    className="block w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-[var(--text-secondary)]">{t('login.password')}</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input id="password" type={showPassword ? 'text' : 'password'} required value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('login.passwordPlaceholder')}
                                    className="block w-full pl-10 pr-10 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading || !username || !password}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20">
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t('login.submitting')}
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    {t('login.submit')}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-[var(--text-muted)] mt-6">{t('login.footer', { year: new Date().getFullYear() })}</p>
            </div>
        </div>
    );
};
