const express         = require('express');
const router          = express.Router();
const Iniciativa      = require('../models/Iniciativa');
const Equipo          = require('../models/Equipo');
const Entorno         = require('../models/Entorno');
const Solicitud       = require('../models/Solicitud');
const verificarToken  = require('../middleware/auth');

// =========================================================
// GET /api/iniciativas — público (trae privadas si hay token)
// =========================================================
router.get('/', async (req, res) => {
  try {
    let usuarioId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        usuarioId = decoded.id;
      } catch (e) {
        // Token inválido
      }
    }

    let filtro = { estado: { $ne: 'eliminada' } };
    
    if (usuarioId) {
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
      filtro.visibilidad = 'publica';
    }

    const items = await Iniciativa.find(filtro).populate('lider', 'nombre email');
    
    const itemsConEquipo = await Promise.all(items.map(async (ini) => {
      const equipo = await Equipo.findOne({ iniciativa: ini._id });
      const entorno = await Entorno.findOne({ iniciativa: ini._id });
      const pertenezco = equipo ? equipo.miembros.some(m => m.toString() === usuarioId) : false;
      const esMio = usuarioId ? ini.lider._id.toString() === usuarioId.toString() : false;

      return {
        ...ini.toObject(),
        miembrosCount: equipo ? equipo.miembros.length : 1,
        entornoId: entorno ? entorno._id : null,
        pertenezco: pertenezco,
        esMio: esMio
      };
    }));

    res.json(itemsConEquipo);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// =========================================================
// POST /api/iniciativas/unirse-codigo — (DEBE IR ANTES DE /:id)
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

    const equipo = await Equipo.findOne({ iniciativa: ini._id });
    if (equipo && equipo.miembros.some(m => m.toString() === req.usuario.id)) {
      return res.status(400).json({ error: 'Ya perteneces a este equipo' });
    }

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

// =========================================================
// GET /api/iniciativas/:id — público
// =========================================================
router.get('/:id', async (req, res) => {
  try {
    const item = await Iniciativa.findById(req.params.id)
      .populate('lider', 'nombre email habilidades intereses biografia disponibilidad portafolio'); // <-- Traemos todo el perfil
    if (!item) return res.status(404).json({ error: 'No encontrada' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =========================================================
// POST /api/iniciativas — crea Iniciativa + Equipo + Entorno
// =========================================================
router.post('/', verificarToken, async (req, res) => {
  try {
    let codigo = null;
    if (req.body.visibilidad === 'privada') {
      codigo = 'NEXO-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    const nueva = await Iniciativa.create({
      ...req.body,
      lider: req.usuario.id,
      visibilidad: req.body.visibilidad || 'publica',
      codigoAcceso: codigo,
      estado: 'abierta'
    });

    const equipo = await Equipo.create({
      iniciativa: nueva._id,
      lider: req.usuario.id,
      miembros: [req.usuario.id]
    });

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
// PUT /api/iniciativas/:id — solo el líder
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
// PUT /api/iniciativas/:id/terminar — solo el líder
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

    ini.estado = modo === 'cerrar' ? 'cerrada' : 'eliminada';
    ini.fechaCierreReal = new Date();
    await ini.save();

    await Equipo.findOneAndUpdate({ iniciativa: ini._id }, { activo: false });
    await Entorno.findOneAndUpdate({ iniciativa: ini._id }, { activo: false });

    await Solicitud.updateMany(
      { iniciativa: ini._id, estado: 'aceptada' },
      {
        estado: 'finalizada',
        motivoFinalizacion: modo === 'cerrar' ? 'iniciativa_cerrada' : 'iniciativa_eliminada',
        fechaFinalizacion: new Date()
      }
    );

    await Solicitud.updateMany(
      { iniciativa: ini._id, estado: 'pendiente' },
      { estado: 'cancelada' }
    );

    if (modo === 'eliminar') {
      await Solicitud.updateMany(
        { iniciativa: ini._id, estado: 'finalizada' },
        { visibilidadEnPerfil: 'eliminado' }
      );
    }

    res.json({
      mensaje: modo === 'cerrar' ? 'Iniciativa cerrada' : 'Iniciativa eliminada',
      iniciativa: ini
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =========================================================
// DELETE /api/iniciativas/:id — solo admin
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

module.exports = router;