const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const verificarToken = require('../middleware/auth');
const router = express.Router();

// =========================================================
// POST /api/auth/registro
// Crea un usuario nuevo. Siempre con rol "usuario".
// El rol admin NO se puede crear desde aquí.
// =========================================================
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    // Solo se guardan los campos permitidos.
    // El rol se fuerza a "usuario" sin importar lo que venga en el body.
    const usuario = await Usuario.create({
      nombre,
      email,
      password: hash,
      rol: 'usuario'
    });

    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// =========================================================
// POST /api/auth/login
// Inicia sesión y devuelve un token JWT.
// El token incluye id, email y rol.
// =========================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son obligatorios' });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const valida = await bcrypt.compare(password, usuario.password);
    if (!valida) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// GET /api/auth/perfil
// Devuelve los datos del usuario autenticado (sin password).
// =========================================================
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;