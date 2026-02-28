import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface RoleGuardProps {
    allowedRoles: Array<'admin' | 'user'>;
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        // Si está intentando ir a un lugar sin permisos, retornarlo al Home
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
