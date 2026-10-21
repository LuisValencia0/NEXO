const express         = require('express');
const router          = express.Router();
const Iniciativa      = require('../models/Iniciativa');
const Equipo          = require('../models/Equipo');
const Entorno         = require('../models/Entorno');
const Solicitud       = require('../models/Solicitud');
const verificarToken  = require('../middleware/auth');

// =========================================================
// GET /api/iniciativas — público
// =========================================================
// GET /api/iniciativas — público (pero si hay token, trae tus privadas)
router.get('/', async (req, res) => {
  try {
    // 1. Si hay token, sabemos quién es el usuario
    let usuarioId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        usuarioId = decoded.id;
      } catch (e) {
        // Token inválido, lo tratamos como público
      }
    }

    // 2. Armar el filtro
    let filtro = { estado: { $ne: 'eliminada' } }; // No traer eliminadas
    
    if (usuarioId) {
      // Si está logueado, traer públicas + sus privadas (como líder o miembro)
      // Para las privadas donde es miembro, necesitamos buscar los equipos donde está
      const equipos = await Equipo.find({ miembros: usuarioId }).select('iniciativa');
      const misIniciativasComoMiembro = equipos.map(e => e.iniciativa);

      filtro = {
        estado: { $ne: 'eliminada' },
        $or: [
          { visibilidad: 'publica' },
          { visibilidad: 'privada', lider: usuarioId },
          { visibilidad: 'privada', _id: { $in: misIniciativasComoMiembro } }
        ]
      };
    } else {
      // Si no está logueado, solo públicas
      filtro.visibilidad = 'publica';
    }

    const items = await Iniciativa.find(filtro).populate('lider', 'nombre email');
    
    // Inyectar miembrosCount (igual que hicimos antes)
    const itemsConEquipo = await Promise.all(items.map(async (ini) => {
      const equipo = await Equipo.findOne({ iniciativa: ini._id });
      return {
        ...ini.toObject(),
        miembrosCount: equipo ? equipo.miembros.length : 1
      };
    }));

    res.json(itemsConEquipo);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// =========================================================
// GET /api/iniciativas/:id — público
// =========================================================
router.get('/:id', async (req, res) => {
  try {
    const item = await Iniciativa.findById(req.params.id)
      .populate('lider', 'nombre email habilidades');
    if (!item) return res.status(404).json({ error: 'No encontrada' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =========================================================
// POST /api/iniciativas — cualquier usuario autenticado
// Crea la iniciativa + equipo + entorno
// =========================================================
router.post('/', verificarToken, async (req, res) => {
  try {
    // Generar código si es privada
    let codigo = null;
    if (req.body.visibilidad === 'privada') {
      codigo = 'NEXO-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    // 1. Crear la iniciativa con visibilidad y código
    const nueva = await Iniciativa.create({
      ...req.body,
      lider: req.usuario.id,
      visibilidad: req.body.visibilidad || 'publica', // <-- FORZAMOS LA VISIBILIDAD
      codigoAcceso: codigo,                           // <-- FORZAMOS EL CÓDIGO
      estado: 'abierta'                               // <-- Siempre nace abierta a postulaciones
    });

    // 2. Crear el equipo automáticamente
    const equipo = await Equipo.create({
      iniciativa: nueva._id,
      lider: req.usuario.id,
      miembros: [req.usuario.id]
    });

    // 3. Crear el entorno automáticamente
    const entorno = await Entorno.create({
      iniciativa: nueva._id,
      equipo: equipo._id,
      nombre: nueva.titulo,
      descripcion: nueva.descripcion,
      area: nueva.area
    });

    res.status(201).json({
      iniciativa: nueva,
      equipo: equipo._id,
      entorno: entorno._id
    });

  } catch (err) { res.status(400).json({ error: err.message }); }
});

// =========================================================
// PUT /api/iniciativas/:id — solo el líder dueño
// =========================================================
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const ini = await Iniciativa.findById(req.params.id);
    if (!ini) return res.status(404).json({ error: 'No encontrada' });

    if (ini.lider.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el líder puede actualizar esta iniciativa' });
    }

    const actualizado = await Iniciativa.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    res.json(actualizado);

  } catch (err) { res.status(400).json({ error: err.message }); }
});

// =========================================================
// PUT /api/iniciativas/:id/terminar — solo el líder dueño
// Body: { "modo": "cerrar" | "eliminar" }
//   - "cerrar": la iniciativa queda como recuerdo para todos
//   - "eliminar": no queda recuerdo para nadie
// =========================================================
router.put('/:id/terminar', verificarToken, async (req, res) => {
  try {
    const { modo } = req.body;

    if (!['cerrar', 'eliminar'].includes(modo)) {
      return res.status(400).json({ error: 'El modo debe ser "cerrar" o "eliminar"' });
    }

    const ini = await Iniciativa.findById(req.params.id);
    if (!ini) return res.status(404).json({ error: 'No encontrada' });

    if (ini.estado === 'cerrada' || ini.estado === 'eliminada') {
      return res.status(400).json({ error: 'La iniciativa ya fue terminada' });
    }

    if (ini.lider.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el líder puede terminar esta iniciativa' });
    }

    // 1. Actualizar la iniciativa según el modo
    if (modo === 'cerrar') {
      ini.estado = 'cerrada';
    } else {
      ini.estado = 'eliminada';
    }
    ini.fechaCierreReal = new Date();
    await ini.save();

    // 2. Desactivar equipo y entorno
    await Equipo.findOneAndUpdate({ iniciativa: ini._id }, { activo: false });
    await Entorno.findOneAndUpdate({ iniciativa: ini._id }, { activo: false });

    // 3. Finalizar solicitudes aceptadas
    await Solicitud.updateMany(
      { iniciativa: ini._id, estado: 'aceptada' },
      {
        estado: 'finalizada',
        motivoFinalizacion: modo === 'cerrar' ? 'iniciativa_cerrada' : 'iniciativa_eliminada',
        fechaFinalizacion: new Date()
      }
    );

    // 4. Cancelar solicitudes pendientes
    await Solicitud.updateMany(
      { iniciativa: ini._id, estado: 'pendiente' },
      { estado: 'cancelada' }
    );

    // 5. Si el modo es "eliminar", ocultar los recuerdos de todos los perfiles
    if (modo === 'eliminar') {
      await Solicitud.updateMany(
        { iniciativa: ini._id, estado: 'finalizada' },
        { visibilidadEnPerfil: 'eliminado' }
      );
    }

    res.json({
      mensaje: modo === 'cerrar'
        ? 'Iniciativa cerrada correctamente'
        : 'Iniciativa eliminada correctamente',
      iniciativa: ini
    });

  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =========================================================
// DELETE /api/iniciativas/:id — solo el admin
// Elimina de verdad la iniciativa de la base (por moderación)
// =========================================================
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo un admin puede eliminar iniciativas' });
    }

    const ini = await Iniciativa.findById(req.params.id);
    if (!ini) return res.status(404).json({ error: 'No encontrada' });

    await Iniciativa.findByIdAndDelete(req.params.id);

    res.json({ mensaje: 'Iniciativa eliminada correctamente' });

  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =========================================================
// PUT /api/iniciativas/:id/limite — solo el líder
// Actualiza el límite de colaboradores (sin bajar de los ya aceptados)
// =========================================================
router.put('/:id/limite', verificarToken, async (req, res) => {
  try {
    const { nuevoLimite } = req.body;
    
    if (!nuevoLimite || nuevoLimite < 1) {
      return res.status(400).json({ error: 'El límite debe ser al menos 1' });
    }

    const ini = await Iniciativa.findById(req.params.id);
    if (!ini) return res.status(404).json({ error: 'No encontrada' });

    if (ini.lider.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el líder puede cambiar el límite' });
    }

    // Verificar cuántos miembros hay actualmente en el equipo
    const equipo = await Equipo.findOne({ iniciativa: ini._id });
    const miembrosActuales = equipo ? equipo.miembros.length : 1; // 1 por el líder

    if (nuevoLimite < miembrosActuales) {
      return res.status(400).json({ 
        error: `No puedes reducir el límite a ${nuevoLimite} porque ya hay ${miembrosActuales} personas en el equipo.` 
      });
    }

    ini.limiteColaboradores = nuevoLimite;
    await ini.save();

    res.json({ mensaje: 'Límite actualizado', limiteColaboradores: nuevoLimite });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// PUT /api/iniciativas/:id/limite — solo el líder
// =========================================================
router.put('/:id/limite', verificarToken, async (req, res) => {
  try {
    const { nuevoLimite } = req.body;

    if (!nuevoLimite || nuevoLimite < 1) {
      return res.status(400).json({ error: 'El límite debe ser al menos 1' });
    }

    const ini = await Iniciativa.findById(req.params.id);
    if (!ini) return res.status(404).json({ error: 'No encontrada' });

    if (ini.lider.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el líder puede cambiar el límite' });
    }

    // Verificar que no baje de los miembros actuales
    const equipo = await Equipo.findOne({ iniciativa: ini._id });
    const miembrosActuales = equipo ? equipo.miembros.length : 1;

    if (nuevoLimite < miembrosActuales) {
      return res.status(400).json({
        error: `No puedes reducir el límite a ${nuevoLimite} porque ya hay ${miembrosActuales} personas en el equipo.`
      });
    }

    ini.limiteColaboradores = nuevoLimite;
    await ini.save();

    res.json({ mensaje: 'Límite actualizado', limiteColaboradores: nuevoLimite });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// POST /api/iniciativas/unirse-codigo — unirse a privada
// =========================================================
router.post('/unirse-codigo', verificarToken, async (req, res) => {
  try {
    const { codigo } = req.body;
    if (!codigo) return res.status(400).json({ error: 'El código es obligatorio' });

    const ini = await Iniciativa.findOne({ codigoAcceso: codigo.toUpperCase(), visibilidad: 'privada' });
    if (!ini) return res.status(404).json({ error: 'Código inválido o iniciativa no encontrada' });

    if (ini.lider.toString() === req.usuario.id) {
      return res.status(400).json({ error: 'Ya eres el líder de esta iniciativa' });
    }

    // Verificar si ya está en el equipo
    const equipo = await Equipo.findOne({ iniciativa: ini._id });
    if (equipo && equipo.miembros.some(m => m.toString() === req.usuario.id)) {
      return res.status(400).json({ error: 'Ya perteneces a este equipo' });
    }

    // Postularse directamente (o podrías ponerlo como pendiente de aceptación)
    const nueva = await Solicitud.create({
      iniciativa: ini._id,
      usuario: req.usuario.id,
      tipo: 'postulacion',
      mensaje: 'Unido mediante código de invitación',
      iniciadaPor: req.usuario.id
    });

    ini.postulacionesCount += 1;
    await ini.save();

    res.status(201).json({ mensaje: 'Te has postulado a la iniciativa privada', solicitud: nueva, iniciativa: ini });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;