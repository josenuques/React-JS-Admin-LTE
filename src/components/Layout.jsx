import React, { useContext, useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { UserContext } from '../context/UserProvider';
import Sidebar from './Sidebar';

const Layout = () => {
    const { user, cerrarSession } = useContext(UserContext);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 991);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const sidebarRef = useRef(null);
    const contentRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setSidebarCollapsed(window.innerWidth <= 991);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    useEffect(() => {
        document.body.classList.toggle('sidebar-collapse', sidebarCollapsed);
        document.body.classList.toggle('sidebar-open', !sidebarCollapsed && window.innerWidth <= 991);
    }, [sidebarCollapsed]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (window.innerWidth <= 991 && 
                !sidebarCollapsed && 
                sidebarRef.current && 
                !sidebarRef.current.contains(event.target) &&
                contentRef.current && 
                contentRef.current.contains(event.target)) {
                setSidebarCollapsed(true);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [sidebarCollapsed]);

    return (
        <div className="wrapper">
            <Sidebar collapsed={sidebarCollapsed} ref={sidebarRef} />

            <nav className="main-header navbar navbar-expand navbar-white navbar-light">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <button className="nav-link btn" onClick={toggleSidebar}>
                            <i className="fas fa-bars"></i>
                        </button>
                    </li>
                </ul>
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item dropdown" ref={userMenuRef}>
                        <a className="nav-link" href="#" onClick={toggleUserMenu}>
                            <i className="fas fa-user-circle fa-2x"></i>
                        </a>
                        {showUserMenu && (
                            <div className="dropdown-menu dropdown-menu-right show">
                                <Link to="/account-settings" className="dropdown-item">
                                    <i className="fas fa-cog mr-2"></i> Configuración de cuenta
                                </Link>
                                <div className="dropdown-divider"></div>
                                <a href="#" className="dropdown-item" onClick={cerrarSession}>
                                    <i className="fas fa-sign-out-alt mr-2"></i> Cerrar sesión
                                </a>
                            </div>
                        )}
                    </li>
                </ul>
            </nav>

            <div className="content-wrapper" ref={contentRef}>
                <Outlet />
            </div>

            <footer className="main-footer">
                <strong>Copyright © 2023 <a href="https://adminlte.io">AdminLTE.io</a>.</strong>
                All rights reserved.
            </footer>
        </div>
    );
};

export default Layout;