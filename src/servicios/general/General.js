import { URL_APIS } from '../../general/apiConfig';

export const ListarTiposEmpresa = async () => {
    try {
        const response = await fetch(URL_APIS.TYPES_LIST, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener tipos de empresa');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const ListarProvincias = async () => {
    try {
        const response = await fetch(URL_APIS.PROVINCES_LIST, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener provincias');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const ListarCiudades = async (idProvincia) => {
    try {
        const response = await fetch(`${URL_APIS.CITIES_LIST}?idProvincia=${idProvincia}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener ciudades');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};