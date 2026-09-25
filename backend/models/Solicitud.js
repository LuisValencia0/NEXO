const mongoose = require('mongoose');

const SolicitudSchema = new mongoose.Schema({

  // A qué iniciativa pertenece
  iniciativa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Iniciativa',
    required: true
  },

  // Usuario que se postula
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  // Tipo de solicitud (en el MVP solo se usa "postulacion")
  tipo: {
    type: String,
    enum: ['postulacion', 'invitacion'],
    default: 'postulacion'
  },

  // Mensaje opcional del postulante
  mensaje: {
    type: String,
    default: ''
  },

  // Estado de la solicitud
  estado: {
    type: String,
    enum: ['pendiente', 'aceptada', 'rechazada'],
    default: 'pendiente'
  },

  // Quién inició la solicitud (útil para auditoría y para saber si fue el líder o el postulante)
  iniciadaPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Solicitud', SolicitudSchema);