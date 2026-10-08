import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-nexo-accent via-nexo-accent-2 to-nexo-accent-3 bg-clip-text text-transparent">
              NEXO
            </span>
          </Link>
          <p className="text-nexo-muted mt-3">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="card-nexo space-y-4">
          <div>
            <label className="block text-sm text-nexo-muted mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-base"
              placeholder="tucorreo@nexo.com"
            />
          </div>

          <div>
            <label className="block text-sm text-nexo-muted mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-base"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full disabled:opacity-50"
          >
            {cargando ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-nexo-muted mt-6 text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-nexo-accent hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}