const mongoose = require('mongoose');

const EquipoSchema = new mongoose.Schema({

  iniciativa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Iniciativa',
    required: true,
    unique: true
  },

  lider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  miembros: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Usuario',
    default: []
  },

  activo: {
    type: Boolean,
    default: true
  },

  historial: [{
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    accion: {
      type: String,
      enum: ['salio', 'finalizado_por_el_lider', 'cedio_liderazgo', 'recibio_liderazgo']
    },
    fecha: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

module.exports = mongoose.model('Equipo', EquipoSchema);