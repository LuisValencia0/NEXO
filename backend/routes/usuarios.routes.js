const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const verificarToken = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

const router = express.Router();

// Todas las rutas de este archivo requieren ser Admin
router.use(verificarToken, verificarAdmin);

// =========================================================
// GET /api/usuarios — Listar (con paginación, búsqueda y filtros)
// Query params: ?page=1&limit=20&buscar=texto&rol=usuario&activo=true
// =========================================================
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filtro = {};

    // Búsqueda por nombre o email (case-insensitive)
    if (req.query.buscar) {
      filtro.$or = [
        { nombre: { $regex: req.query.buscar, $options: 'i' } },
        { email:  { $regex: req.query.buscar, $options: 'i' } }
      ];
    }

    // Filtro por rol (admin/usuario)
    if (req.query.rol) {
      filtro.rol = req.query.rol;
    }

    // Filtro por estado (activo/inactivo)
    if (req.query.activo !== undefined) {
      filtro.activo = req.query.activo === 'true';
    }

    const total = await Usuario.countDocuments(filtro);
    const usuarios = await Usuario.find(filtro)
      .select('-password')
      .sort({ fechaRegistro: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      usuarios,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// GET /api/usuarios/:id — Ver detalle completo de un usuario
// =========================================================
router.get('/:id', async (req, res) => {
  try {
    // Aquí SÍ mostramos el email porque es contexto de admin
    const usuario = await Usuario.findById(req.params.id).select('-password');
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// PUT /api/usuarios/:id — Editar (Soporte / Ban)
// =========================================================
router.put('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Protección: Admin no puede banearse a sí mismo
    if (req.params.id === req.usuario.id && req.body.activo === false) {
      return res.status(400).json({ error: 'No puedes suspender tu propia cuenta de administrador' });
    }

    // Solo estos campos son editables por el admin
    const camposEditables = [
      'nombre', 'email', 'habilidades', 'intereses', 
      'biografia', 'disponibilidad', 'portafolio', 'activo'
    ];
    const actualizacion = {};

    camposEditables.forEach(campo => {
      if (req.body[campo] !== undefined) {
        actualizacion[campo] = req.body[campo];
      }
    });

    // Si cambia el email, verificar que no esté en uso
    if (actualizacion.email && actualizacion.email !== usuario.email) {
      const existe = await Usuario.findOne({ email: actualizacion.email });
      if (existe) {
        return res.status(400).json({ error: 'El email ya está en uso por otro usuario' });
      }
    }

    // Si el admin resetea la contraseña (Soporte)
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      actualizacion.password = await bcrypt.hash(req.body.password, 10);
    }

    const actualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      actualizacion,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ mensaje: 'Usuario actualizado', usuario: actualizado });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// =========================================================
// DELETE /api/usuarios/:id — Soft-delete (Ban)
// =========================================================
router.delete('/:id', async (req, res) => {
  try {
    // Protección: Admin no puede eliminarse a sí mismo
    if (req.params.id === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de administrador' });
    }

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Soft-delete: En lugar de borrar, desactivamos la cuenta
    usuario.activo = false;
    await usuario.save();

    res.json({ 
      mensaje: 'Usuario suspendido correctamente', 
      id: usuario._id, 
      activo: usuario.activo 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;