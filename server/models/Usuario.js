const mongoose = require('mongoose')

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  rol: { type: String, required: true, default: 'agente' },
})

module.exports = mongoose.model('Usuario', usuarioSchema)