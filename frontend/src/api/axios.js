import axios from 'axios';

// URL base del backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor: agrega el token a cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: si el token expira o es inválido (401), cierra sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexo_token');
      localStorage.removeItem('nexo_usuario');
      // Solo redirige si no estamos ya en login/registro
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/registro')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;