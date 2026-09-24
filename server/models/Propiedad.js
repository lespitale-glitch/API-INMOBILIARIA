const mongoose = require('mongoose')

const propiedadSchema = new mongoose.Schema({
  direccion: { type: String, required: true, trim: true },
  zona: { type: String, required: true, trim: true },
  ambientes: { type: Number, required: true },
  metros_cuadrados: { type: Number, required: true },
  precio: { type: Number, required: true },
  operacion: { type: String, required: true, enum: ['Venta', 'Alquiler'] },
  caracteristicas: [{ type: String }],
  imagenes: [{ type: String }],
  agente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TipoPropiedad', required: true },
})

// Índice compuesto solicitado por el TP
propiedadSchema.index({ precio: 1, operacion: 1 })

module.exports = mongoose.model('Propiedad', propiedadSchema)