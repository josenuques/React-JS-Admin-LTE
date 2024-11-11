// URL base del servidor
const SERVER_BASE_URL = "https://localhost:44379";

export const URL_APIS = {
  LOGIN: `${SERVER_BASE_URL}/login/iniciarSesion`,
  USERS_LIST: `${SERVER_BASE_URL}/Configuracion/ListarUsuarios`,
  USERS_SAVE: `${SERVER_BASE_URL}/Configuracion/GuardarUsuario`,
  USERS_DELETE: `${SERVER_BASE_URL}/Configuracion/EliminarUsuario`,
  PROFILES_LIST: `${SERVER_BASE_URL}/Configuracion/ListarPerfiles`,
  PROFILES_SAVE: `${SERVER_BASE_URL}/Configuracion/GuardarPerfil`,
  PROFILES_DELETE: `${SERVER_BASE_URL}/Configuracion/EliminarPerfil`,
  PROFILES_PERMISSIONS: `${SERVER_BASE_URL}/Configuracion/ListarPermisos`,
  COMPANY_GET: `${SERVER_BASE_URL}/Configuracion/ConsultarEmpresa`,
  COMPANY_SAVE: `${SERVER_BASE_URL}/Configuracion/GuardarEmpresa`,
  TYPES_LIST: `${SERVER_BASE_URL}/General/ListarTiposEmpresa`,
  PROVINCES_LIST: `${SERVER_BASE_URL}/General/ListarProvincias`,
  CITIES_LIST: `${SERVER_BASE_URL}/General/ListarCiudades`
};