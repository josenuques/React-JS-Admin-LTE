import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/UserProvider';
import { useNavigate, Navigate } from 'react-router-dom';
import { URL_APIS } from '../../general/apiConfig';
import Swal from 'sweetalert2';
import './Login.css';

const Login = () => {
    const { user, iniciarSession } = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
        
        console.log('Login URL:', URL_APIS.LOGIN);
		
		if(username !== '' || password !== '') {
            iniciarSession(request);
            navigate("/");
        }       
        
        try {
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
            Swal.fire('No se pudo iniciar sesión.','error')
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="user-icon">
                    <i className="fas fa-user-circle"></i>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Nombre de usuario:</label>
                        <input 
                            type="email" 
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Contraseña:</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Iniciar sesión</button>
                    <a href="#" className="forgot-password">Recuperar contraseña</a>
                </form>
                <div className="copyright">© Todos los derechos reservados.</div>
            </div>
        </div>
    );
};

export default Login;