const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({

  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  rol: {
    type: String,
    enum: ['admin', 'usuario'],
    default: 'usuario'
  },

  habilidades: { type: [String], default: [] },
  intereses:   { type: [String], default: [] },
  biografia:   { type: String, default: '' },
  disponibilidad: { type: String, default: '' },
  portafolio:  { type: String, default: '' },
  fechaRegistro: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);