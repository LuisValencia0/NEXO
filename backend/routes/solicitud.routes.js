const express = require('express');
const router = express.Router();
const Solicitud = require('../models/Solicitud');
const Iniciativa = require('../models/Iniciativa');
const verificarToken = require('../middleware/auth');

// =========================================================
// POST /api/solicitudes
// Un usuario se postula a una iniciativa
// =========================================================
router.post('/', verificarToken, async (req, res) => {
  try {
    const { iniciativa, mensaje } = req.body;

    if (!iniciativa) {
      return res.status(400).json({ error: 'iniciativa es obligatoria' });
    }

    const ini = await Iniciativa.findById(iniciativa);
    if (!ini) return res.status(404).json({ error: 'Iniciativa no encontrada' });

    // No se puede postular a la propia iniciativa
    if (ini.lider.toString() === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes postularte a tu propia iniciativa' });
    }

    // Verificar que no exista una postulación activa
    const existente = await Solicitud.findOne({
      iniciativa,
      usuario: req.usuario.id,
      estado: { $in: ['pendiente', 'aceptada'] }
    });

    if (existente) {
      return res.status(400).json({ error: 'Ya tienes una postulación activa a esta iniciativa' });
    }

    const nueva = await Solicitud.create({
      iniciativa,
      usuario: req.usuario.id,
      tipo: 'postulacion',
      mensaje: mensaje || '',
      iniciadaPor: req.usuario.id
    });

    // Incrementar contador en la iniciativa
    ini.postulacionesCount += 1;
    await ini.save();

    res.status(201).json(nueva);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// GET /api/solicitudes/mias
// Las postulaciones que YO envié
// =========================================================
router.get('/mias', verificarToken, async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({
      usuario: req.usuario.id
    })
      .populate('iniciativa', 'titulo area estado lider')
      .sort({ createdAt: -1 });

    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// GET /api/solicitudes/recibidas
// Las postulaciones que llegaron a MIS iniciativas (líder)
// =========================================================
router.get('/recibidas', verificarToken, async (req, res) => {
  try {
    const misIniciativas = await Iniciativa.find({ lider: req.usuario.id }).select('_id');
    const ids = misIniciativas.map(i => i._id);

    const solicitudes = await Solicitud.find({ iniciativa: { $in: ids } })
      .populate('usuario', 'nombre email habilidades intereses')
      .populate('iniciativa', 'titulo area estado')
      .sort({ createdAt: -1 });

    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// GET /api/solicitudes/iniciativa/:id
// El líder ve las solicitudes de UNA iniciativa específica
// =========================================================
router.get('/iniciativa/:id', verificarToken, async (req, res) => {
  try {
    const ini = await Iniciativa.findById(req.params.id);
    if (!ini) return res.status(404).json({ error: 'Iniciativa no encontrada' });

    if (ini.lider.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el líder puede ver estas solicitudes' });
    }

    const solicitudes = await Solicitud.find({ iniciativa: req.params.id })
      .populate('usuario', 'nombre email habilidades intereses')
      .sort({ createdAt: -1 });

    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// PUT /api/solicitudes/:id/aceptar
// El líder acepta una postulación
// =========================================================
router.put('/:id/aceptar', verificarToken, async (req, res) => {
  try {
    const sol = await Solicitud.findById(req.params.id).populate('iniciativa');
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada' });

    if (sol.estado !== 'pendiente') {
      return res.status(400).json({ error: 'La solicitud ya fue procesada' });
    }

    if (sol.iniciativa.lider.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el líder puede aceptar postulaciones' });
    }

    sol.estado = 'aceptada';
    await sol.save();

    res.json({ mensaje: 'Solicitud aceptada', solicitud: sol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// PUT /api/solicitudes/:id/rechazar
// El líder rechaza una postulación
// =========================================================
router.put('/:id/rechazar', verificarToken, async (req, res) => {
  try {
    const sol = await Solicitud.findById(req.params.id).populate('iniciativa');
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada' });

    if (sol.estado !== 'pendiente') {
      return res.status(400).json({ error: 'La solicitud ya fue procesada' });
    }

    if (sol.iniciativa.lider.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el líder puede rechazar postulaciones' });
    }

    sol.estado = 'rechazada';
    await sol.save();

    res.json({ mensaje: 'Solicitud rechazada', solicitud: sol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// DELETE /api/solicitudes/:id
// El postulante retira su propia postulación
// =========================================================
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const sol = await Solicitud.findById(req.params.id);
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada' });

    if (sol.usuario.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo el autor puede retirar su postulación' });
    }

    await Solicitud.findByIdAndDelete(req.params.id);

    // Decrementar contador
    const ini = await Iniciativa.findById(sol.iniciativa);
    if (ini && ini.postulacionesCount > 0) {
      ini.postulacionesCount -= 1;
      await ini.save();
    }

    res.json({ mensaje: 'Postulación retirada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;