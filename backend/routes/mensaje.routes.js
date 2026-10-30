const express = require('express');
const router = express.Router();
const Mensaje = require('../models/Mensaje');
const verificarToken = require('../middleware/auth');

// Exportamos una función que recibe "io" (el servidor de Socket.io)
module.exports = (io) => {

  // GET /api/mensajes/:entornoId -> Traer historial
  router.get('/:entornoId', verificarToken, async (req, res) => {
    try {
      const mensajes = await Mensaje.find({ entorno: req.params.entornoId })
        .populate('autor', 'nombre')
        .sort({ createdAt: 1 }); // Los más viejos primero
      res.json(mensajes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/mensajes/:entornoId -> Enviar mensaje
  router.post('/:entornoId', verificarToken, async (req, res) => {
    try {
      const { contenido } = req.body;
      if (!contenido || !contenido.trim()) {
        return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
      }

      const nuevoMensaje = await Mensaje.create({
        entorno: req.params.entornoId,
        autor: req.usuario.id,
        contenido: contenido.trim()
      });

      // Lo poblamos antes de devolverlo para que el frontend sepa el nombre del autor
      await nuevoMensaje.populate('autor', 'nombre');

      // 🔥 AQUÍ ESTÁ LA MAGIA: Emitimos el mensaje a todos los que estén en ese entorno
      io.to(req.params.entornoId).emit('mensaje_recibido', nuevoMensaje);

      res.status(201).json(nuevoMensaje);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};