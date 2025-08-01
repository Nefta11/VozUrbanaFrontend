import axios from "axios";

// Configuración base de la API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_VERSION = import.meta.env.VITE_API_VERSION || "api";

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable para almacenar la función de logout del contexto
let authLogoutHandler = null;

// Función para configurar el handler de logout
export const setAuthLogoutHandler = (handler) => {
  authLogoutHandler = handler;
};

// Interceptor para agregar el token JWT a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Si no es FormData, mantener Content-Type application/json
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // Si es FormData, axios maneja automáticamente el Content-Type multipart/form-data
    // NO establecer Content-Type manualmente para FormData
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (authLogoutHandler) {
        authLogoutHandler();
      } else {
        // Fallback si no hay handler configurado
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
