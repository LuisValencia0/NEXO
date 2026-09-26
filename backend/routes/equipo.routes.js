const express = require('express');
const router = express.Router();
const Equipo = require('../models/Equipo');
const Iniciativa = require('../models/Iniciativa');
const Entorno = require('../models/Entorno');
const Solicitud = require('../models/Solicitud');
const verificarToken = require('../middleware/auth');

// =========================================================
// GET /api/equipos/mios
// Equipos donde participo (como líder o miembro)
// =========================================================
router.get('/mios', verificarToken, async (req, res) => {
  try {
    const equipos = await Equipo.find({ miembros: req.usuario.id })
      .populate('iniciativa', 'titulo area estado')
      .populate('lider', 'nombre email')
      .populate('miembros', 'nombre email')
      .sort({ createdAt: -1 });

    res.json(equipos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// GET /api/equipos/:id
// Ver un equipo específico (solo miembros)
// =========================================================
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id)
      .populate('iniciativa', 'titulo area estado')
      .populate('lider', 'nombre email')
      .populate('miembros', 'nombre email habilidades');

    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });

    const esMiembro = equipo.miembros.some(m => m._id.toString() === req.usuario.id);
    if (!esMiembro) {
      return res.status(403).json({ error: 'No eres miembro de este equipo' });
    }

    res.json(equipo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// DELETE /api/equipos/:id/salir
// El miembro sale del equipo (requiere confirmación escrita)
// Body: { "confirmacion": "SALIR" }
// =========================================================
router.delete('/:id/salir', verificarToken, async (req, res) => {
  try {
    const { confirmacion } = req.body;

    if (confirmacion !== 'SALIR') {
      return res.status(400).json({ error: 'Debes escribir "SALIR" para confirmar' });
    }

    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });

    if (equipo.lider.toString() === req.usuario.id) {
      return res.status(400).json({
        error: 'El líder no puede salir. Debe ceder el liderazgo primero.'
      });
    }

    const esMiembro = equipo.miembros.some(m => m.toString() === req.usuario.id);
    if (!esMiembro) {
      return res.status(400).json({ error: 'No eres miembro de este equipo' });
    }

    // 1. Quitar del equipo
    equipo.miembros = equipo.miembros.filter(m => m.toString() !== req.usuario.id);
    equipo.historial.push({ usuario: req.usuario.id, accion: 'salio' });
    await equipo.save();

    // 2. Finalizar la solicitud con motivo
    await Solicitud.findOneAndUpdate(
      { iniciativa: equipo.iniciativa, usuario: req.usuario.id, estado: 'aceptada' },
      {
        estado: 'finalizada',
        motivoFinalizacion: 'salio_por_decision_propia',
        fechaFinalizacion: new Date()
      }
    );

    res.json({ mensaje: 'Saliste del equipo correctamente' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// DELETE /api/equipos/:id/finalizar/:usuarioId
// El líder da por finalizada la participación de un miembro
// Body: { "confirmacion": "FINALIZAR" }
// =========================================================
router.delete('/:id/finalizar/:usuarioId', verificarToken, async (req, res) => {
  try {
    const { confirmacion } = req.body;

    if (confirmacion !== 'FINALIZAR') {
      return res.status(400).json({ error: 'Debes escribir "FINALIZAR" para confirmar' });
    }

    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });

    if (equipo.lider.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el líder puede finalizar la participación de un miembro' });
    }

    const usuarioId = req.params.usuarioId;

    if (usuarioId === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes finalizar tu propia participación' });
    }

    const esMiembro = equipo.miembros.some(m => m.toString() === usuarioId);
    if (!esMiembro) {
      return res.status(400).json({ error: 'Ese usuario no está en el equipo' });
    }

    // 1. Quitar del equipo
    equipo.miembros = equipo.miembros.filter(m => m.toString() !== usuarioId);
    equipo.historial.push({ usuario: usuarioId, accion: 'finalizado_por_el_lider' });
    await equipo.save();

    // 2. Finalizar la solicitud con motivo
    await Solicitud.findOneAndUpdate(
      { iniciativa: equipo.iniciativa, usuario: usuarioId, estado: 'aceptada' },
      {
        estado: 'finalizada',
        motivoFinalizacion: 'finalizado_por_el_lider',
        fechaFinalizacion: new Date()
      }
    );

    res.json({ mensaje: 'La participación del miembro fue finalizada correctamente' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// PUT /api/equipos/:id/ceder-liderazgo
// El líder cede el liderazgo a otro miembro
// Body: { "nuevoLider": "id", "confirmacion": "CEDER" }
// =========================================================
router.put('/:id/ceder-liderazgo', verificarToken, async (req, res) => {
  try {
    const { nuevoLider, confirmacion } = req.body;

    if (confirmacion !== 'CEDER') {
      return res.status(400).json({ error: 'Debes escribir "CEDER" para confirmar' });
    }

    if (!nuevoLider) {
      return res.status(400).json({ error: 'Debes indicar el nuevo líder' });
    }

    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });

    if (equipo.lider.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el líder puede ceder el liderazgo' });
    }

    const esMiembro = equipo.miembros.some(m => m.toString() === nuevoLider);
    if (!esMiembro) {
      return res.status(400).json({ error: 'El nuevo líder debe ser miembro del equipo' });
    }

    if (nuevoLider === req.usuario.id) {
      return res.status(400).json({ error: 'Ya eres el líder de este equipo' });
    }

    // 1. Actualizar el equipo
    const antiguoLider = equipo.lider;
    equipo.lider = nuevoLider;
    equipo.historial.push({ usuario: antiguoLider, accion: 'cedio_liderazgo' });
    equipo.historial.push({ usuario: nuevoLider, accion: 'recibio_liderazgo' });
    await equipo.save();

    // 2. Actualizar la iniciativa
    await Iniciativa.findByIdAndUpdate(equipo.iniciativa, { lider: nuevoLider });

    res.json({
      mensaje: 'Liderazgo cedido correctamente',
      nuevoLider
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;