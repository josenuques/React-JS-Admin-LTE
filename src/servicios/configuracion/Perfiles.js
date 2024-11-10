import { URL_APIS } from '../../general/apiConfig';

export const obtenerPerfiles = async (idEmpresa) => {
    try {
        const response = await fetch(`${URL_APIS.PROFILES_LIST}?idEmpresa=${idEmpresa}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los perfiles');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const ListarPermisos = async (idPerfil, idEmpresa) => {
    try {
        const response = await fetch(`${URL_APIS.PROFILES_PERMISSIONS}?idPerfil=${idPerfil}&idEmpresa=${idEmpresa}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los permisos');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const GuardarPerfil = async (idEmpresa, idPerfil) => {
    try {
        const perfilData = {
            id: idPerfil,
            idempresa: idEmpresa,
            idNivelSeguridad: 0,
            descripcion: "",
            idNivel: 0,
            nivel: "",
            estado: true,
            permisos: [
                {
                    idEmpresa: idEmpresa,
                    idPerfil: idPerfil,
                    idOpcion: 0,
                    activo: 0
                }
            ]
        };

        const response = await fetch(URL_APIS.PROFILES_SAVE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(perfilData)
        });

        if (!response.ok) {
            throw new Error('Error al guardar el perfil');
        }

        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const EliminarPerfil = async (idEmpresa, idPerfil) => {
    try {

        const response = await fetch(`${URL_APIS.PROFILES_DELETE}?idPerfil=${idPerfil}&idEmpresa=${idEmpresa}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar el perfil');
        }

        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const perfilModelo = {
    id: 0,
    idempresa: 0,
    idNivelSeguridad: 0,
    descripcion: "",
    idNivel: 0,
    nivel: "",
    estado: true,
    permisos: null
};