const express = require('express');
const router = express.Router();
const Entorno = require('../models/Entorno');
const Equipo = require('../models/Equipo');
const verificarToken = require('../middleware/auth');

// =========================================================
// GET /api/entornos/mios
// Entornos donde participo (como líder o miembro)
// =========================================================
router.get('/mios', verificarToken, async (req, res) => {
  try {
    // 1. Buscar los equipos donde estoy
    const equipos = await Equipo.find({ miembros: req.usuario.id }).select('_id');
    const equipoIds = equipos.map(e => e._id);

    // 2. Buscar los entornos de esos equipos
    const entornos = await Entorno.find({ equipo: { $in: equipoIds } })
      .populate('iniciativa', 'titulo area estado')
      .sort({ createdAt: -1 });

    res.json(entornos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// GET /api/entornos/:id
// Ver un entorno específico (solo miembros del equipo)
// =========================================================
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const entorno = await Entorno.findById(req.params.id)
      .populate('iniciativa', 'titulo area estado lider')
      .populate('equipo', 'lider miembros activo');

    if (!entorno) return res.status(404).json({ error: 'Entorno no encontrado' });

    // Verificar que el usuario sea miembro del equipo
    const esMiembro = entorno.equipo.miembros.some(
      m => m.toString() === req.usuario.id
    );

    if (!esMiembro) {
      return res.status(403).json({ error: 'No eres miembro de este entorno' });
    }

    res.json(entorno);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// PUT /api/entornos/:id
// El líder personaliza el entorno
// Solo se permiten los campos editables
// =========================================================
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const entorno = await Entorno.findById(req.params.id).populate('equipo');
    if (!entorno) return res.status(404).json({ error: 'Entorno no encontrado' });

    // Verificar que el usuario sea el líder del equipo
    if (entorno.equipo.lider.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el líder puede personalizar el entorno' });
    }

    // Si el entorno está inactivo (iniciativa cerrada/eliminada), no se puede editar
    if (!entorno.activo) {
      return res.status(400).json({ error: 'Este entorno ya no está activo' });
    }

    // Filtrar solo los campos editables
    const camposEditables = [
      'nombre',
      'descripcion',
      'eslogan',
      'icono',
      'portada',
      'colorPrimario',
      'colorSecundario'
    ];

    const actualizacion = {};
    camposEditables.forEach(campo => {
      if (req.body[campo] !== undefined) {
        actualizacion[campo] = req.body[campo];
      }
    });

    const actualizado = await Entorno.findByIdAndUpdate(
      req.params.id,
      actualizacion,
      { new: true, runValidators: true }
    );

    res.json({
      mensaje: 'Entorno actualizado correctamente',
      entorno: actualizado
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;