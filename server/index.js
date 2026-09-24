// API REST - Nuevo Techo Propiedades & Hogar
// Rutas:
//   GET  /api/properties       -> propiedades pobladas (agente + tipo)
//   GET  /api/tipos-propiedad  -> tipos de inmueble
//   POST /api/contactos        -> formulario de tasación del cliente React
//
// Si MongoDB está disponible usa los modelos Mongoose; si no, sirve los
// datos de ejemplo del TP desde data/seedData.js (modo memoria).

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const Propiedad = require('./models/Propiedad')
const TipoPropiedad = require('./models/TipoPropiedad')
const Contacto = require('./models/Contacto')
const seedData = require('./data/seedData')

const app = express()
const PORT = process.env.PORT || 3001
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nuevo_techo'

app.use(cors())
app.use(express.json())

let mongoOk = false

// Estado en memoria (fallback sin MongoDB y destino de POST /api/contactos)
const memoria = {
  agentes: [...seedData.agentes],
  tipos: [...seedData.tipos],
  propiedades: [...seedData.propiedades],
  contactos: [...seedData.contactos],
}

// Si existe db.json (generado por seed.js) se usa como fuente inicial
const dbJson = path.join(__dirname, 'data', 'db.json')
if (fs.existsSync(dbJson)) {
  try {
    const datos = JSON.parse(fs.readFileSync(dbJson, 'utf8'))
    memoria.agentes = datos.agentes
    memoria.tipos = datos.tipos
    memoria.propiedades = datos.propiedades
    memoria.contactos = datos.contactos
  } catch {
    console.warn('No se pudo leer data/db.json, se usan los datos embebidos.')
  }
}

function poblarEnMemoria(propiedades) {
  return propiedades.map((prop) => {
    const agenteDoc = memoria.agentes.find((a) => a._id === prop.agente_id)
    const tipoDoc = memoria.tipos.find((t) => t._id === prop.tipo_id)
    return {
      ...prop,
      tipo_id: tipoDoc ? { _id: tipoDoc._id, nombre_tipo: tipoDoc.nombre_tipo } : prop.tipo_id,
      agente_id: agenteDoc
        ? { _id: agenteDoc._id, nombre: agenteDoc.nombre, email: agenteDoc.email, rol: agenteDoc.rol }
        : prop.agente_id,
    }
  })
}

// GET /api/properties - lista de propiedades con datos poblados
app.get('/api/properties', async (req, res) => {
  try {
    if (mongoOk) {
      const propiedades = await Propiedad.find()
        .populate('agente_id', 'nombre email rol')
        .populate('tipo_id', 'nombre_tipo')
      return res.json(propiedades)
    }
    res.json(poblarEnMemoria(memoria.propiedades))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tipos-propiedad - tipos de inmuebles
app.get('/api/tipos-propiedad', async (req, res) => {
  try {
    if (mongoOk) {
      return res.json(await TipoPropiedad.find())
    }
    res.json(memoria.tipos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/contactos - formulario de tasación del cliente React
app.post('/api/contactos', async (req, res) => {
  try {
    const { nombre, email, telefono, zona, metros, metros_cuadrados, mensaje, acepta, acepta_novedades, tipo, tipo_id } = req.body

    if (!nombre || !email) {
      return res.status(400).json({ error: 'nombre y email son requeridos' })
    }

    const datos = {
      nombre,
      email,
      telefono,
      zona,
      metros_cuadrados: metros_cuadrados ?? (metros != null && metros !== '' ? Number(metros) : undefined),
      mensaje,
      acepta_novedades: acepta_novedades ?? acepta ?? false,
    }

    if (mongoOk) {
      let tipoFinal = tipo_id || null
      if (!tipoFinal && tipo) {
        const tipoDoc = await TipoPropiedad.findOne({ nombre_tipo: tipo })
        tipoFinal = tipoDoc ? tipoDoc._id : null
      }
      const contacto = await Contacto.create({ ...datos, tipo_id: tipoFinal })
      return res.status(201).json({ mensaje: 'Consulta registrada', contacto })
    }

    // Fallback en memoria
    const tipoDoc = memoria.tipos.find((t) => t.nombre_tipo === tipo)
    const contacto = {
      ...datos,
      tipo_id: tipoDoc ? tipoDoc._id : null,
      fecha: new Date().toISOString(),
    }
    memoria.contactos.push(contacto)
    res.status(201).json({ mensaje: 'Consulta registrada (en memoria)', contacto })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

async function iniciar() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
    mongoOk = true
    console.log('MongoDB conectado')
  } catch {
    mongoOk = false
    console.warn(`MongoDB no disponible en ${MONGO_URI}. Modo memoria activado.`)
  }

  app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`)
    console.log(`  GET  /api/properties      (${mongoOk ? 'mongo' : 'memoria'})`)
    console.log('  GET  /api/tipos-propiedad')
    console.log('  POST /api/contactos')
  })
}

iniciar()