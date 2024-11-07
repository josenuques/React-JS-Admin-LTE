import { URL_APIS } from '../../general/apiConfig';

export const empresaModelo = {
    id: 0,
    nombreComercial: "",
    razonSocial: "",
    identificacion: "",
    idTipoEmpresa: 0,
    tipoEmpresa: "",
    idProvincia: 0,
    provincia: "",
    idCiudad: 0,
    ciudad: "",
    direccion: "",
    telefono: "",
    correo: "",
    inicioActividad: "",
    inicioActividadTexto: "",
    logoRuta: "",
    logoArchivo: null,
    estado: false
};

export const ConsultarEmpresa = async (idEmpresa) => {
    try {
        const response = await fetch(`${URL_APIS.COMPANY_GET}?idEmpresa=${idEmpresa}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al consultar la empresa');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const GuardarEmpresa = async (empresa, imagenArchivo) => {
    try {
        const formData = new FormData();
        
        // Agregar los datos de la empresa como JSON string
        formData.append('oEmpresa', JSON.stringify(empresa));
        
        // Agregar el archivo de imagen si existe
        if (imagenArchivo) {
            // Validar extensiones permitidas
            const extensionesPermitidas = ['.jpg', '.png', '.jpeg'];
            const extension = '.' + imagenArchivo.name.split('.').pop().toLowerCase();
            
            if (!extensionesPermitidas.includes(extension)) {
                throw new Error('Formato de imagen no permitido. Use: jpg, png o jpeg');
            }
            
            formData.append('imagenArchivo', imagenArchivo);
        }

        const response = await fetch(URL_APIS.COMPANY_SAVE, {
            method: 'POST',
            body: formData
            // No incluir Content-Type header, el navegador lo establecerá automáticamente con el boundary correcto
        });

        if (!response.ok) {
            throw new Error('Error al guardar la empresa');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};