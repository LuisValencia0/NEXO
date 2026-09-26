const mongoose = require('mongoose');

const EntornoSchema = new mongoose.Schema({

  // Cada entorno pertenece a una sola iniciativa (1 a 1)
  iniciativa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Iniciativa',
    required: true,
    unique: true
  },

  // Cada entorno pertenece a un solo equipo (1 a 1)
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true,
    unique: true
  },

  // === Campos personalizables por el líder ===
  nombre:      { type: String, required: true },
  descripcion: { type: String, default: '' },
  eslogan:     { type: String, default: '' },
  icono:       { type: String, default: '' },
  portada:     { type: String, default: '' },
  colorPrimario:   { type: String, default: '#6d8bff' },
  colorSecundario: { type: String, default: '#b06dff' },

  // Heredado de la iniciativa (no editable)
  area: { type: String },

  // Estado del entorno
  activo: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Entorno', EntornoSchema);