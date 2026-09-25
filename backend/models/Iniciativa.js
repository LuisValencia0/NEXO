const mongoose = require('mongoose');

const IniciativaSchema = new mongoose.Schema({

  titulo: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true },
  area: {
    type: String,
    enum: ['tecnología', 'cultura', 'educación', 'emprendimiento', 'social', 'otro'],
    required: true
  },
  estado: {
    type: String,
    enum: ['abierta', 'en_proceso', 'cerrada'],
    default: 'abierta'
  },
  colaboradoresRequeridos: { type: [String], default: [] },
  habilidadesBuscadas:     { type: [String], default: [] },
  fechaCierre: { type: Date },

  // Referencia al usuario que creó la iniciativa
  lider: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  postulacionesCount: { type: Number, default: 0 }
  
}, { timestamps: true });

module.exports = mongoose.model('Iniciativa', IniciativaSchema);