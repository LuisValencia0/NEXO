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
router.get('/', async (req, res) => {
  try {
    const items = await Iniciativa.find()
      .populate('lider', 'nombre email');
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
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
    const nueva = await Iniciativa.create({
      ...req.body,
      lider: req.usuario.id
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

module.exports = router;