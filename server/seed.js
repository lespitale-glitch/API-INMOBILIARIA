// Script de inicialización de datos del TP.
// Si MongoDB está disponible: inserta los documentos en la base.
// Si no: escribe data/db.json para que el servidor opere en memoria.
//
// Uso: npm run seed   (fuerza reinicio con: npm run seed -- --reset)

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Usuario = require('./models/Usuario')
const TipoPropiedad = require('./models/TipoPropiedad')
const Propiedad = require('./models/Propiedad')
const Contacto = require('./models/Contacto')
const { agentes, tipos, propiedades, contactos } = require('./data/seedData')

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nuevo_techo'
const DB_JSON = path.join(__dirname, 'data', 'db.json')

function escribirJsonMemoria() {
  const datos = {
    _modo: 'memoria',
    _aviso: 'MongoDB no disponible. Datos de ejemplo en JSON; el servidor los sirve desde aquí.',
    agentes,
    tipos,
    propiedades,
    contactos,
  }
  fs.writeFileSync(DB_JSON, JSON.stringify(datos, null, 2))
  console.log(`MongoDB no disponible. Datos de ejemplo escritos en ${DB_JSON}`)
  console.log('Para usar MongoDB: instalalo y ejecutá "npm run seed" de nuevo.')
}

async function seedMongo() {
  const reset = process.argv.includes('--reset')
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })

  const colecciones = [Usuario, TipoPropiedad, Propiedad, Contacto]
  const existentes = await Promise.all(colecciones.map((m) => m.countDocuments()))
  const hayDatos = existentes.some((n) => n > 0)

  if (hayDatos && !reset) {
    console.log('La base ya contiene datos. Usá "--reset" para volver a sembrar.')
    await mongoose.disconnect()
    return
  }

  await Promise.all(colecciones.map((m) => m.deleteMany({})))

  // Los datos ya traen _id fijos y referencias directas (agente_id/tipo_id)
  await Usuario.insertMany(agentes)
  await TipoPropiedad.insertMany(tipos)
  await Propiedad.insertMany(propiedades)
  await Contacto.insertMany(contactos)

  console.log(
    `Base sembrada: ${agentes.length} usuarios, ${tipos.length} tipos, ` +
      `${propiedades.length} propiedades, ${contactos.length} contactos.`
  )
  await mongoose.disconnect()
}

async function main() {
  try {
    await seedMongo()
  } catch (err) {
    console.warn(`No se pudo conectar a MongoDB (${err.message}).`)
    escribirJsonMemoria()
    process.exitCode = 0
  }
}

main()