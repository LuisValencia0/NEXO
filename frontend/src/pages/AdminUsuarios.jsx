import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, ShieldAlert, Ban, CheckCircle, 
  Eye, Key, X, Loader2, ChevronLeft, ChevronRight, Mail 
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminUsuarios() {
  const { usuario: adminActual } = useAuth();
  
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados de filtros y paginación
  const [buscar, setBuscar] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  // Estados para Modales
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [modalPassword, setModalPassword] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Cargar usuarios
  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const params = {
        page: pagina,
        limit: 10,
        buscar: buscar || undefined,
        rol: filtroRol || undefined,
        activo: filtroActivo === 'todos' ? undefined : filtroActivo === 'activos'
      };
      
      const { data } = await api.get('/usuarios', { params });
      setUsuarios(data.usuarios);
      setTotalPaginas(data.pages);
      setTotalUsuarios(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // Efecto con debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarUsuarios();
    }, 500);
    return () => clearTimeout(timer);
  }, [buscar, filtroRol, filtroActivo, pagina]);

  // Acción: Banear / Reactivar
  const handleToggleActivo = async (user) => {
    if (user.email === adminActual.email) return; // Protección visual
    
    const accion = user.activo ? 'suspender' : 'reactivar';
    if (!window.confirm(`¿Estás seguro de ${accion} a ${user.nombre}?`)) return;

    try {
      if (user.activo) {
        await api.delete(`/usuarios/${user._id}`);
      } else {
        await api.put(`/usuarios/${user._id}`, { activo: true });
      }
      cargarUsuarios(); // Recargar lista
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  // Acción: Resetear Contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (nuevaPassword.length < 6) return alert('Mínimo 6 caracteres');
    
    setProcesando(true);
    try {
      await api.put(`/usuarios/${modalPassword._id}`, { password: nuevaPassword });
      alert('Contraseña actualizada correctamente');
      setModalPassword(null);
      setNuevaPassword('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-nexo-accent" /> Gestión de Usuarios
          </h1>
          <p className="text-nexo-muted text-sm mt-1">Panel de administración de NEXO</p>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm">
          Total registrados: <strong className="text-nexo-accent">{totalUsuarios}</strong>
        </div>
      </div>

      {/* FILTROS */}
      <div className="card-nexo p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexo-muted" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={buscar}
            onChange={(e) => { setBuscar(e.target.value); setPagina(1); }}
            className="input-base pl-10 w-full"
          />
        </div>
        <select 
          className="input-base w-full md:w-48"
          value={filtroRol}
          onChange={(e) => { setFiltroRol(e.target.value); setPagina(1); }}
        >
          <option value="">Todos los roles</option>
          <option value="usuario">Usuarios</option>
          <option value="admin">Administradores</option>
        </select>
        <select 
          className="input-base w-full md:w-48"
          value={filtroActivo}
          onChange={(e) => { setFiltroActivo(e.target.value); setPagina(1); }}
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Suspendidos</option>
        </select>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="card-nexo overflow-hidden">
        {cargando ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-nexo-accent" size={32} /></div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-20 text-nexo-muted">No se encontraron usuarios.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-nexo-muted bg-white/5">
                  <th className="p-4 font-medium">Usuario</th>
                  <th className="p-4 font-medium">Rol</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Registro</th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usuarios.map(u => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="font-medium">{u.nombre}</p>
                      <p className="text-xs text-nexo-muted flex items-center gap-1 mt-1"><Mail size={12}/> {u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-md border ${u.rol === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-white/5 text-nexo-muted border-white/10'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.activo !== false ? (
                        <span className="text-xs px-2 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1 w-fit"><CheckCircle size={12}/> Activo</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit"><Ban size={12}/> Suspendido</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-nexo-muted">
                      {new Date(u.fechaRegistro || u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => setUsuarioDetalle(u)} title="Ver detalle" className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-nexo-accent">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => setModalPassword(u)} title="Resetear contraseña" className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-yellow-400">
                        <Key size={16} />
                      </button>
                      {u.email !== adminActual.email && (
                        <button 
                          onClick={() => handleToggleActivo(u)} 
                          title={u.activo !== false ? "Suspender cuenta" : "Reactivar cuenta"}
                          className={`p-2 rounded-md transition-colors ${u.activo !== false ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                        >
                          {u.activo !== false ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex justify-between items-center pt-4">
          <button 
            disabled={pagina === 1} 
            onClick={() => setPagina(p => p - 1)}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="text-sm text-nexo-muted">Página {pagina} de {totalPaginas}</span>
          <button 
            disabled={pagina === totalPaginas} 
            onClick={() => setPagina(p => p + 1)}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* MODAL: DETALLE DE USUARIO */}
      <AnimatePresence>
        {usuarioDetalle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="card-nexo max-w-md w-full p-6 relative">
              <button onClick={() => setUsuarioDetalle(null)} className="absolute top-4 right-4 text-nexo-muted hover:text-white"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Detalle del Usuario</h2>
              
              <div className="space-y-4 text-sm">
                <div><p className="text-nexo-muted">Nombre</p><p className="font-medium">{usuarioDetalle.nombre}</p></div>
                <div><p className="text-nexo-muted">Email</p><p className="font-medium text-nexo-accent">{usuarioDetalle.email}</p></div>
                <div><p className="text-nexo-muted">Rol</p><p className="capitalize">{usuarioDetalle.rol}</p></div>
                <div><p className="text-nexo-muted">Registro</p><p>{new Date(usuarioDetalle.fechaRegistro).toLocaleString()}</p></div>
                <div><p className="text-nexo-muted">Biografía</p><p>{usuarioDetalle.biografia || 'No especificada.'}</p></div>
                <div>
                  <p className="text-nexo-muted mb-1">Habilidades</p>
                  <div className="flex flex-wrap gap-1">
                    {usuarioDetalle.habilidades?.length ? usuarioDetalle.habilidades.map(h => <span key={h} className="text-xs bg-white/10 px-2 py-1 rounded">{h}</span>) : 'Ninguna'}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: RESET PASSWORD */}
      <AnimatePresence>
        {modalPassword && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.form onSubmit={handleResetPassword} initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="card-nexo max-w-sm w-full p-6 relative">
              <button type="button" onClick={() => setModalPassword(null)} className="absolute top-4 right-4 text-nexo-muted hover:text-white"><X size={20}/></button>
              <h2 className="text-lg font-bold mb-1">Resetear Contraseña</h2>
              <p className="text-xs text-nexo-muted mb-4">Soporte para: <strong className="text-white">{modalPassword.email}</strong></p>
              
              <label className="text-sm text-nexo-muted mb-2 block">Nueva contraseña</label>
              <input 
                type="text" 
                value={nuevaPassword} 
                onChange={e => setNuevaPassword(e.target.value)}
                className="input-base w-full mb-4" 
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button type="submit" disabled={procesando} className="btn-primary w-full flex justify-center items-center gap-2">
                {procesando ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                Actualizar
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}