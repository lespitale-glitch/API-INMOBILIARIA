const mongoose = require('mongoose')

const contactoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true }, // opcional si llega solo teléfono (ChatBot)
  telefono: { type: String, trim: true },
  zona: { type: String, trim: true },
  metros_cuadrados: { type: Number },
  mensaje: { type: String, trim: true },
  acepta_novedades: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now },
  tipo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TipoPropiedad' },
  origen: { type: String, default: 'Web' }, // 'Web' | 'ChatBot'
})

module.exports = mongoose.model('Contacto', contactoSchema)