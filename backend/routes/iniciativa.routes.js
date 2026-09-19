const express         = require('express');
const router          = express.Router();
const Iniciativa         = require('../models/Iniciativa');
const verificarToken = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

// GET todos — público
router.get('/', async (req, res) => {
  try {
    const items = await Iniciativa.find();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET por ID — público
router.get('/:id', async (req, res) => {
  try {
    const item = await Iniciativa.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrado' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST crear — protegido
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nuevo = await Iniciativa.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT actualizar — protegido
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const actualizado = await Iniciativa.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    res.json(actualizado);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE eliminar — protegido
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    await Iniciativa.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;