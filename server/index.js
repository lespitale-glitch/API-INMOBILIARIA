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
const crypto = require('crypto')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Propiedad = require('./models/Propiedad')
const TipoPropiedad = require('./models/TipoPropiedad')
const Contacto = require('./models/Contacto')
const Usuario = require('./models/Usuario')
const seedData = require('./data/seedData')

const app = express()
const PORT = process.env.PORT || 3002
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nuevo_techo'

app.use(cors())
app.use(express.json({ limit: '15mb' })) // imágenes en data-URL desde el panel admin
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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

// Sesiones de login: token -> usuario (sin password). Se generan en memoria
// con crypto.randomBytes; se invalidan al reiniciar el servidor.
const sesiones = new Map()

function generarToken(usuario) {
  const token = crypto.randomBytes(24).toString('hex')
  sesiones.set(token, usuario)
  return token
}

function requerirAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  const usuario = token && sesiones.get(token)
  if (!usuario) return res.status(401).json({ error: 'No autorizado: iniciá sesión' })
  req.usuario = usuario
  next()
}

// GET /api/usuarios - personal de la inmobiliaria (sin passwords)
app.get('/api/usuarios', async (req, res) => {
  try {
    if (mongoOk) {
      return res.json(await Usuario.find().select('-password'))
    }
    res.json(memoria.agentes.map(({ password, ...u }) => u))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/usuarios/login - valida email + password (bcrypt) y devuelve token
app.post('/api/usuarios/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son requeridos' })
    }

    let usuario = null
    let ok = false
    if (mongoOk) {
      usuario = await Usuario.findOne({ email })
      if (usuario) ok = await bcrypt.compare(password, usuario.password)
    } else {
      usuario = memoria.agentes.find((a) => a.email === email)
      if (usuario) ok = bcrypt.compareSync(password, usuario.password)
    }

    if (!usuario || !ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const publico = { _id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    res.json({ token: generarToken(publico), usuario: publico })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/imagenes - sube una imagen (data-URL) del panel admin y la guarda
// en server/uploads/, devolviendo la ruta pública /uploads/<id>.<ext>
app.post('/api/imagenes', requerirAuth, (req, res) => {
  try {
    const { data } = req.body || {}
    const match = /^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/.exec(String(data || ''))
    if (!match) {
      return res.status(400).json({ error: 'Se espera una imagen data-URL (png, jpg, gif o webp)' })
    }
    const ext = { png: 'png', jpg: 'jpg', jpeg: 'jpg', gif: 'gif', webp: 'webp' }[match[1].toLowerCase()]
    const archivo = `${crypto.randomBytes(8).toString('hex')}.${ext}`
    const dir = path.join(__dirname, 'uploads')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, archivo), Buffer.from(match[2], 'base64'))
    res.status(201).json({ url: `/uploads/${archivo}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/properties - alta de propiedad (requiere token de /api/usuarios/login)
app.post('/api/properties', requerirAuth, async (req, res) => {
  try {
    const { direccion, zona, ambientes, metros_cuadrados, precio, operacion, caracteristicas, imagenes, imagenes_etiquetas, agente_id, tipo_id } = req.body

    if (!direccion || !zona || ambientes == null || ambientes === '' || metros_cuadrados == null || metros_cuadrados === '' || precio == null || precio === '' || !operacion || !agente_id || !tipo_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: direccion, zona, ambientes, metros_cuadrados, precio, operacion, agente_id, tipo_id' })
    }
    if (!['Venta', 'Alquiler'].includes(operacion)) {
      return res.status(400).json({ error: "operacion debe ser 'Venta' o 'Alquiler'" })
    }

    const datos = {
      direccion: String(direccion).trim(),
      zona: String(zona).trim(),
      ambientes: Number(ambientes),
      metros_cuadrados: Number(metros_cuadrados),
      precio: Number(precio),
      operacion,
      caracteristicas: Array.isArray(caracteristicas)
        ? caracteristicas.map((c) => String(c).trim()).filter(Boolean)
        : String(caracteristicas || '').split(',').map((c) => c.trim()).filter(Boolean),
      imagenes: Array.isArray(imagenes) ? imagenes.map((i) => String(i).trim()).filter(Boolean) : (imagenes ? [String(imagenes).trim()] : []),
      ...(Array.isArray(imagenes_etiquetas) ? { imagenes_etiquetas: imagenes_etiquetas.map((e) => String(e)) } : {}),
      agente_id,
      tipo_id,
    }

    if (mongoOk) {
      const creada = await Propiedad.create(datos)
      const poblada = await Propiedad.findById(creada._id)
        .populate('agente_id', 'nombre email rol')
        .populate('tipo_id', 'nombre_tipo')
      return res.status(201).json(poblada)
    }

    const nueva = { _id: crypto.randomBytes(12).toString('hex'), ...datos }
    memoria.propiedades.push(nueva)
    res.status(201).json(poblarEnMemoria([nueva])[0])
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