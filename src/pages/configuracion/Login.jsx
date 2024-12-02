import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/UserProvider';
import { useNavigate, Navigate } from 'react-router-dom';
import { URL_APIS } from '../../general/apiConfig';
import LoadingOverlay from '../../components/LoadingOverlay';
import Swal from 'sweetalert2';
import './Login.css';

const Login = () => {
    const { user, iniciarSession } = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        let request = {
            correo: username,
            clave: password
        }

        try {
            setLoading(true);
            const response = await fetch(URL_APIS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const dataJson = await response.json();

            if (dataJson.id != 0) {
                iniciarSession(dataJson);
                navigate("/");
            } else {
                Swal.fire(
                    'Oops!',
                    'No se encontraron coincidencias',
                    'error'
                )
            }
        } catch (error) {
            console.error('Login Error:', error);
            Swal.fire('No se pudo iniciar sesión.', 'error')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <LoadingOverlay visible={loading} />
            <div className="login-box">
                {/* <div className="logo">
                    <img src="/img/logo.png" alt="Logo" />
                </div> */}
                <div className="user-icon">
                    <i className="fas fa-user-circle"></i>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Correo electrónico</label>
                        <input
                            type="email"
                            id="username"
                            placeholder="ejemplo@correo.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Ingrese su contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                    <a href="#" className="forgot-password" onClick={(e) => {
                        e.preventDefault();
                        if (!loading) {
                            Swal.fire({
                                title: 'Recuperar contraseña',
                                text: 'Por favor, contacte al administrador del sistema.',
                                icon: 'info'
                            });
                        }
                    }}>
                        ¿Olvidaste tu contraseña?
                    </a>
                </form>
                <div className="copyright"> {new Date().getFullYear()} CENTEK. Todos los derechos reservados.</div>
            </div>
        </div>
    );
};

export default Login;