const mongoose = require('mongoose')

const tipoPropiedadSchema = new mongoose.Schema({
  nombre_tipo: { type: String, required: true, unique: true, trim: true },
})

module.exports = mongoose.model('TipoPropiedad', tipoPropiedadSchema)