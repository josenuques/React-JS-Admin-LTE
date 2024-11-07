import { URL_APIS } from '../../general/apiConfig';

export const ListarUsuarios = async (idEmpresa) => {
    try {
        const response = await fetch(`${URL_APIS.USERS_LIST}?idEmpresa=${idEmpresa}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los usuarios');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const GuardarUsuario = async (usuario) => {
    try {
        const response = await fetch(URL_APIS.USERS_SAVE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            throw new Error('Error al guardar el usuario');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const EliminarUsuario = async (idEmpresa, idUsuario) => {
    try {
        const response = await fetch(URL_APIS.USERS_DELETE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idEmpresa: idEmpresa,
                idUsuario: idUsuario
            })
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el usuario');
        }

        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const usuarioModelo = {
    id: 0,
    idempresa: 0,
    nombres: "",
    apellidos: "",
    nombrecompleto: "",
    correo: "",
    clave: "",
    idperfil: 0,
    perfil: "",
    idNivelSeguridad: 0,
    estado: true,
    estadotexto: "",
    menu: null
};