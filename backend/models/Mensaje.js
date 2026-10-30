const mongoose = require('mongoose');

const MensajeSchema = new mongoose.Schema({
  entorno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entorno',
    required: true
  },
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  contenido: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Mensaje', MensajeSchema);