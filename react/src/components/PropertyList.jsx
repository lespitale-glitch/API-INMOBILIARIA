import React from 'react'
import PropertyCard from './PropertyCard'
import './PropList.css'

// Datos de prueba basados en el HTML original
const properties = [
  // Destacadas
  {
    image: '/img/destacadas/casa.jpeg',
    title: 'Casa moderna',
    subtitle: '3 ambientes · Jardín · USD 120.000',
    badge: 'Destacada',
    category: 'destacadas',
  },
  {
    image: '/img/destacadas/departamento centrico.jpeg',
    title: 'Departamento céntrico',
    subtitle: '2 ambientes · Balcón · USD 85.000',
    badge: 'Destacada',
    category: 'destacadas',
  },
  {
    image: '/img/destacadas/oficina.jpeg',
    title: 'Oficina comercial',
    subtitle: '30 m² · Microcentro · Alquiler',
    badge: 'Destacada',
    category: 'destacadas',
  },
  {
    image: '/img/destacadas/casa_con_pileta.jpeg',
    title: 'Casa con pileta',
    subtitle: '5 ambientes · Pileta · USD 210.000',
    badge: 'Destacada',
    category: 'destacadas',
  },
  {
    image: '/img/destacadas/depto_premium.jpeg',
    title: 'Departamento premium',
    subtitle: '2 ambientes · USD 145.000',
    badge: 'Destacada',
    category: 'destacadas',
  },
  {
    image: '/img/destacadas/oficina_ejecutiva.jpeg',
    title: 'Oficina ejecutiva',
    subtitle: '80 m² · Puerto Madero · Venta',
    badge: 'Destacada',
    category: 'destacadas',
  },
  // Alquiler
  {
    image: '/img/alquiler/casa_jardin.png',
    title: 'Casa con jardín',
    subtitle: '4 Ambientes - Palermo',
    category: 'alquiler',
  },
  {
    image: '/img/alquiler/dpto.png',
    title: 'Departamento céntrico',
    subtitle: '2 Ambientes - Retiro',
    category: 'alquiler',
  },
  {
    image: '/img/alquiler/oficina.png',
    title: 'Oficina comercial',
    subtitle: 'Oficina comercial - 40 m² - Microcentro',
    category: 'alquiler',
  },
  {
    image: '/img/alquiler/casa-moderna-con-jardin.jpg',
    title: 'Casa moderna',
    subtitle: '4 Ambientes - Palermo',
    category: 'alquiler',
  },
  {
    image: '/img/alquiler/depto_moderno.png',
    title: 'Departamento moderno',
    subtitle: '2 Ambientes - Retiro',
    category: 'alquiler',
  },
  {
    image: '/img/alquiler/oficina_grande.png',
    title: 'Oficina grande',
    subtitle: 'Oficina grande - 45 m² - Subsuelo - Microcentro',
    category: 'alquiler',
  },
  // Venta
  {
    image: '/img/venta/casa.png',
    title: 'Casa en venta',
    subtitle: '4 Ambientes - San Isidro',
    category: 'venta',
  },
  {
    image: '/img/venta/depto_lujoso.png',
    title: 'Departamento premium',
    subtitle: '2 Ambientes - Puerto Madero',
    category: 'venta',
  },
  {
    image: '/img/venta/oficina.png',
    title: 'Oficina en venta',
    subtitle: '25 m² - Microcentro',
    category: 'venta',
  },
  {
    image: '/img/venta/casa_moderna.png',
    title: 'Casa moderna',
    subtitle: '4 Ambientes - Zona Roja - Palermo',
    category: 'venta',
  },
]

export const PropertyList = ({ category }) => {
  const filtered = category
    ? properties.filter((prop) => prop.category === category)
    : properties

  return (
    <div className="property-list">
      {filtered.map((prop) => (
        <PropertyCard
          key={prop.image}
          image={prop.image}
          title={prop.title}
          subtitle={prop.subtitle}
          badge={prop.badge}
        />
      ))}
    </div>
  )
}