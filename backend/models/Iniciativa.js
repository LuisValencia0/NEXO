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
    enum: ['abierta', 'en_proceso', 'cerrada', 'eliminada'],
    default: 'abierta'
  },
  colaboradoresRequeridos: { type: [String], default: [] },
  limiteColaboradores: { type: Number, default: 5, min: 1 },
  habilidadesBuscadas:     { type: [String], default: [] },
  fechaCierre: { type: Date },
  fechaCierreReal: { type: Date, default: null },

  // Referencia al usuario que creó la iniciativa
  lider: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  postulacionesCount: { type: Number, default: 0 },

  // Hueco para el futuro (privacidad de la iniciativa)
  // Pública (aparece en explorar) o Privada (solo con código)
  visibilidad: {
    type: String,
    enum: ['publica', 'privada'],
    default: 'publica'
  },
  
  // Código de acceso (solo si es privada)
  codigoAcceso: {
    type: String,
    default: null
  },

}, { timestamps: true });

module.exports = mongoose.model('Iniciativa', IniciativaSchema);