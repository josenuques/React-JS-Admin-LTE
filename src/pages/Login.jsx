import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserProvider';
import { useNavigate, Navigate } from 'react-router-dom';
import { URL_APIS } from '../general/apiConfig';
import Swal from 'sweetalert2';

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
                <div className="card">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg">Sign in to start your session</p>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    placeholder="Email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text">
                                        <span className="fas fa-envelope"></span>
                                    </div>
                                </div>
                            </div>
                            <div className="input-group mb-3">
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text">
                                        <span className="fas fa-lock"></span>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary btn-block">Sign In</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;