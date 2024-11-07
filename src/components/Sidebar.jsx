import React, { useContext, useEffect, useState, forwardRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserProvider';

const modelo = {
    nombre: "",
    correo: "",
    idRolNavigation: {
        idRol: 0,
        descripcion: ""
    }
};

const Sidebar = forwardRef(({ collapsed }, ref) => {
    const { user } = useContext(UserContext);
    const [dataUser, setDataUser] = useState(modelo);
    const [menuItems, setMenuItems] = useState([]);
    const [openMenus, setOpenMenus] = useState({});

    useEffect(() => {
        if (user) {
            setDataUser(user);
            const processedMenu = processMenuData(user.menu || []);
            setMenuItems(processedMenu);
        }
    }, [user]);

    const processMenuData = (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            return [];
        }

        const menuMap = new Map();

        data.forEach(item => {
            if (!menuMap.has(item.menu)) {
                menuMap.set(item.menu, {
                    id: item.id,
                    nombre: item.menu,
                    ico: item.ico,
                    orden: item.orden,
                    submenus: []
                });
            }
            menuMap.get(item.menu).submenus.push({
                id: item.idSubMenu,
                nombre: item.subMenu,
                url: `/${item.menu.toLowerCase().replace(/ /g, '-')}/${item.subMenu.toLowerCase().replace(/ /g, '-')}`
            });
        });

        return Array.from(menuMap.values()).sort((a, b) => a.orden - b.orden);
    };

    const toggleMenu = (menuId) => {
        setOpenMenus(prevState => ({
            ...prevState,
            [menuId]: !prevState[menuId]
        }));
    };

    return (
        <aside ref={ref} className={`main-sidebar sidebar-dark-primary elevation-4 ${collapsed ? 'sidebar-collapse' : ''}`}>
            <Link to="/" className="brand-link">
                <span className="brand-text font-weight-light">AdminLTE 3</span>
            </Link>

            <div className="sidebar">
                <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div className="info">
                        <a href="#" className="d-block">{dataUser.nombre}</a>
                    </div>
                </div>

                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                        <li className="nav-item">
                            <NavLink to="/dashboard" className="nav-link">
                                <i className="nav-icon fas fa-tachometer-alt"></i>
                                <p>Dashboard</p>
                            </NavLink>
                        </li>
                        {menuItems.map((menuItem) => (
                            <li className={`nav-item ${openMenus[menuItem.id] ? 'menu-open' : ''}`} key={menuItem.id}>
                                <a className="nav-link" href="#" onClick={() => toggleMenu(menuItem.id)}>
                                    <i className={menuItem.ico}></i>
                                    <p>
                                        {menuItem.nombre}
                                        <i className="right fas fa-angle-left"></i>
                                    </p>
                                </a>
                                <ul className="nav nav-treeview" style={{display: openMenus[menuItem.id] ? 'block' : 'none'}}>
                                    {menuItem.submenus.map((submenu) => (
                                        <li className="nav-item" key={submenu.id}>
                                            <NavLink to={submenu.url} className="nav-link">
                                                <i className="far fa-circle nav-icon"></i>
                                                <p>{submenu.nombre}</p>
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </aside>
    );
});

export default Sidebar;