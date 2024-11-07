import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserProvider from './context/UserProvider'
import VerificarUsuario from './components/VerificarUsuario'
import Layout from './components/Layout'
import Login from './pages/configuracion/Login'
import Dashboard from './pages/configuracion/Dashboard'
import Usuarios from './pages/configuracion/Usuarios'
import Perfiles from './pages/configuracion/Perfiles'
import Empresas from './pages/configuracion/Empresas'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'admin-lte/dist/css/adminlte.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<VerificarUsuario><Dashboard /></VerificarUsuario>} />
            <Route path="dashboard" element={<VerificarUsuario><Dashboard /></VerificarUsuario>} />
            <Route path="usuarios" element={<VerificarUsuario><Usuarios /></VerificarUsuario>} />
            <Route path="perfiles" element={<VerificarUsuario><Perfiles /></VerificarUsuario>} />
            <Route path="Empresas" element={<VerificarUsuario><Empresas /></VerificarUsuario>} />
          </Route>
        </Routes>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
)