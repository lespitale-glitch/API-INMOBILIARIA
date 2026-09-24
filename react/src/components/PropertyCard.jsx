import React from 'react'
import './PropertyCard.css'

const PropertyCard = ({ image, title, subtitle, price, badge }) => {
  return (
    <article className="card">
      <img className="card-img" src={image} alt={title} />
      <h3>{title}</h3>
      <p>{subtitle}</p>
      {price && <p className="price">{price}</p>}
      {badge && <span className="badge">{badge}</span>}
    </article>
  )
}

export default PropertyCard