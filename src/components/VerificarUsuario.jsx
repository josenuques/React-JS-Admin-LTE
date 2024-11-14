import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserProvider';

const VerificarUsuario = ({ children }) => {
    const { user } = useContext(UserContext);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si estamos en el dashboard o en la raíz, permitir acceso
    if (location.pathname === '/dashboard' || location.pathname === '/') {
        return children;
    }

    // Mapeo de rutas a idSubMenu
    const routeToSubMenuMap = {
        '/usuarios': 20,
        '/perfiles': 21,
        '/empresas': 19,
        // Agregar más mapeos según sea necesario
    };

    const currentSubMenuId = routeToSubMenuMap[location.pathname];

    // Si la ruta actual tiene un idSubMenu asociado, verificar permisos
    if (currentSubMenuId) {
        const menuItem = user.menu?.find(item => item.idSubMenu === currentSubMenuId);
        
        // Si no se encuentra el menú o activo es false, redirigir al dashboard
        if (!menuItem || !menuItem.activo) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default VerificarUsuario;