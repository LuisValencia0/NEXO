import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al montar, recuperar sesión del localStorage
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('nexo_token');
    const usuarioGuardado = localStorage.getItem('nexo_usuario');

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  // Iniciar sesión
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    localStorage.setItem('nexo_token', data.token);
    localStorage.setItem('nexo_usuario', JSON.stringify({
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
    }));

    setToken(data.token);
    setUsuario({ nombre: data.nombre, email: data.email, rol: data.rol });

    return data;
  };

  // Registrar
  const registro = async (nombre, email, password) => {
    const { data } = await api.post('/auth/registro', { nombre, email, password });
    return data;
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('nexo_token');
    localStorage.removeItem('nexo_usuario');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      cargando,
      login,
      registro,
      logout,
      estaAutenticado: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}