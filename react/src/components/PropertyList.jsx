import React from 'react'
import PropertyCard from './PropertyCard'
import './PropList.css'

const IMAGEN_POR_DEFECTO = '/img/destacadas/casa.jpeg'

const coincideFiltros = (prop, filtros) => {
  if (filtros.operacion && prop.operacion !== filtros.operacion) return false
  if (filtros.tipo && prop.tipo_id?._id !== filtros.tipo) return false
  if (filtros.zona) {
    const texto = filtros.zona.trim().toLowerCase()
    const enZona = (prop.zona || '').toLowerCase().includes(texto)
    const enDireccion = (prop.direccion || '').toLowerCase().includes(texto)
    if (!enZona && !enDireccion) return false
  }
  return true
}

export const PropertyList = ({ category, propiedades = [], filtros = {}, cargando = false }) => {
  const filtradas = propiedades.filter((prop) => {
    if (category === 'alquiler' && prop.operacion !== 'Alquiler') return false
    if (category === 'venta' && prop.operacion !== 'Venta') return false
    return coincideFiltros(prop, filtros)
  })

  if (cargando) {
    return (
      <div className="property-list">
        <p className="vacio">Cargando propiedades…</p>
      </div>
    )
  }

  if (!filtradas.length) {
    return (
      <div className="property-list">
        <p className="vacio">No se encontraron propiedades con esos filtros.</p>
      </div>
    )
  }

  return (
    <div className="property-list">
      {filtradas.map((prop) => (
        <PropertyCard
          key={prop._id}
          image={prop.imagenes?.[0] || IMAGEN_POR_DEFECTO}
          title={prop.direccion}
          subtitle={`${prop.ambientes} amb · ${prop.zona} · ${prop.metros_cuadrados} m²`}
          price={`USD ${Number(prop.precio).toLocaleString('es-AR')}`}
          badge={category === 'destacadas' ? 'Destacada' : prop.operacion}
        />
      ))}
    </div>
  )
}
