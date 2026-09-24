// Datos de ejemplo del Trabajo Práctico "Nuevo Techo Propiedades & Hogar".
// Devolución del TP: 3-5 documentos por colección (aquí: 3/4/5/4).
//
// - Todos los documentos incluyen `_id` fijo (hex de 24 caracteres) para que
//   los datos sean idénticos en MongoDB y en el modo memoria (data/db.json).
// - `password` = hash REAL de bcrypt (bcryptjs, costo 10) de la contraseña de
//   demo `nuevotecho2026` (la misma para los 3 usuarios de prueba).
// - `agente_id` / `tipo_id` referencian directamente los `_id` de abajo.

const agentes = [
  {
    _id: '64f1d2e3a4b5c6d7e8f90a01',
    nombre: 'Leandro Spitale',
    email: 'leandro.spitale@nuevotecho.com',
    password: '$2b$10$C1UDPK/CvoVvnq0MaQPvxeaaPOe9Zp.YOkl3L7s0cqGDiI.02xQAG',
    rol: 'agente',
  },
  {
    _id: '64f1d2e3a4b5c6d7e8f90a02',
    nombre: 'Federico Rossi',
    email: 'federico.rossi@nuevotecho.com',
    password: '$2b$10$hkVrOVrKmD9pgoPbJNvOJuQqBM70dau.y39Du/HQ1gGrtVbmHhpjm',
    rol: 'agente',
  },
  {
    _id: '64f1d2e3a4b5c6d7e8f90a03',
    nombre: 'Mariana López',
    email: 'mariana.lopez@nuevotecho.com',
    password: '$2b$10$fD0E3jBdDxE1jnpw2dH3G.8JH4te3E1LYAtcW1uTwZWPW2kw6FQOW',
    rol: 'admin',
  },
]

const tipos = [
  { _id: '64f1d2e3a4b5c6d7e8f90b01', nombre_tipo: 'Casa' },
  { _id: '64f1d2e3a4b5c6d7e8f90b02', nombre_tipo: 'Departamento' },
  { _id: '64f1d2e3a4b5c6d7e8f90b03', nombre_tipo: 'Oficina' },
  { _id: '64f1d2e3a4b5c6d7e8f90b04', nombre_tipo: 'PH' },
]

const propiedades = [
  {
    _id: '64f1d2e3a4b5c6d7e8f90c01',
    direccion: 'Av. Santa Fe 3450',
    zona: 'Palermo',
    ambientes: 3,
    metros_cuadrados: 75,
    precio: 120000,
    operacion: 'Venta',
    caracteristicas: ['Balcón', 'Ascensor', 'Amoblado', 'Parrilla'],
    imagenes: ['/img/destacadas/departamento centrico.jpeg', '/img/alquiler/depto_moderno.png'],
    agente_id: '64f1d2e3a4b5c6d7e8f90a01',
    tipo_id: '64f1d2e3a4b5c6d7e8f90b02',
  },
  {
    _id: '64f1d2e3a4b5c6d7e8f90c02',
    direccion: 'Julián Álvarez 1650',
    zona: 'Belgrano',
    ambientes: 4,
    metros_cuadrados: 140,
    precio: 950,
    operacion: 'Alquiler',
    caracteristicas: ['Jardín', 'Parrilla', 'Cochera', 'Seguridad 24hs'],
    imagenes: ['/img/destacadas/casa.jpeg', '/img/alquiler/casa_jardin.png'],
    agente_id: '64f1d2e3a4b5c6d7e8f90a02',
    tipo_id: '64f1d2e3a4b5c6d7e8f90b01',
  },
  {
    _id: '64f1d2e3a4b5c6d7e8f90c03',
    direccion: 'Av. del Libertador 7800',
    zona: 'San Isidro',
    ambientes: 5,
    metros_cuadrados: 200,
    precio: 280000,
    operacion: 'Venta',
    caracteristicas: ['Parrilla', 'Cochera doble', 'Pileta', 'Quincho'],
    imagenes: ['/img/destacadas/casa_con_pileta.jpeg', '/img/venta/casa.png'],
    agente_id: '64f1d2e3a4b5c6d7e8f90a03',
    tipo_id: '64f1d2e3a4b5c6d7e8f90b01',
  },
  {
    _id: '64f1d2e3a4b5c6d7e8f90c04',
    direccion: 'Junín 1250',
    zona: 'Recoleta',
    ambientes: 2,
    metros_cuadrados: 60,
    precio: 700,
    operacion: 'Alquiler',
    caracteristicas: ['Balcón', 'Ascensor', 'Aire acondicionado'],
    imagenes: ['/img/destacadas/depto_premium.jpeg', '/img/alquiler/dpto.png'],
    agente_id: '64f1d2e3a4b5c6d7e8f90a03',
    tipo_id: '64f1d2e3a4b5c6d7e8f90b02',
  },
  {
    _id: '64f1d2e3a4b5c6d7e8f90c05',
    direccion: 'Gorriti 4800',
    zona: 'Palermo',
    ambientes: 4,
    metros_cuadrados: 110,
    precio: 195000,
    operacion: 'Venta',
    caracteristicas: ['Jardín', 'Parrilla', 'SUM'],
    imagenes: ['/img/alquiler/casa-moderna-con-jardin.jpg', '/img/venta/casa_moderna.png'],
    agente_id: '64f1d2e3a4b5c6d7e8f90a01',
    tipo_id: '64f1d2e3a4b5c6d7e8f90b04',
  },
]

const contactos = [
  {
    _id: '64f1d2e3a4b5c6d7e8f90d01',
    nombre: 'Claudio Benítez',
    email: 'claudio.benitez@gmail.com',
    telefono: '+54 11 4444-8888',
    zona: 'Palermo',
    metros_cuadrados: 75,
    mensaje: 'Solicito la tasación de mi departamento en Palermo (3 ambientes, 75 m²).',
    acepta_novedades: true,
    fecha: '2026-08-15T10:00:00.000Z',
    tipo_id: '64f1d2e3a4b5c6d7e8f90b02',
  },
  {
    _id: '64f1d2e3a4b5c6d7e8f90d02',
    nombre: 'María González',
    email: 'maria.gonzalez@gmail.com',
    telefono: '+54 11 5555-2222',
    zona: 'Belgrano',
    metros_cuadrados: 140,
    mensaje: 'Quiero tasar la casa que tengo en Belgrano antes de publicarla.',
    acepta_novedades: false,
    fecha: '2026-08-28T15:30:00.000Z',
    tipo_id: '64f1d2e3a4b5c6d7e8f90b01',
  },
  {
    _id: '64f1d2e3a4b5c6d7e8f90d03',
    nombre: 'Jorge Peralta',
    email: 'jorge.peralta@outlook.com',
    telefono: '+54 11 6666-3333',
    zona: 'Microcentro',
    metros_cuadrados: 45,
    mensaje: 'Necesito la tasación de una oficina en Microcentro.',
    acepta_novedades: true,
    fecha: '2026-09-10T09:15:00.000Z',
    tipo_id: '64f1d2e3a4b5c6d7e8f90b03',
  },
  {
    _id: '64f1d2e3a4b5c6d7e8f90d04',
    nombre: 'Ana Gutiérrez',
    email: 'ana.gutierrez@yahoo.com.ar',
    telefono: '+54 11 7777-4444',
    zona: 'Palermo',
    metros_cuadrados: 110,
    mensaje: 'Quiero vender mi PH en Palermo, ¿me envían una tasación?',
    acepta_novedades: true,
    fecha: '2026-09-20T12:45:00.000Z',
    tipo_id: '64f1d2e3a4b5c6d7e8f90b04',
  },
]

module.exports = { agentes, tipos, propiedades, contactos }