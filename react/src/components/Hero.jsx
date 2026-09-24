import React from 'react'
import './Hero.css'

export const Hero = () => {
  return (
    <>
      {/* Sección Home con imagen principal y presentación - copiado de index.html original */}
      <section id="home">
        <img
          src="/img/NT/nuevo techo prop y hogar.png"
          alt="Casa principal"
        />

        <div className="contenido-home">
          <h2>Encontrá tu próxima propiedad</h2>
          <p>
            Casas, departamentos y oficinas en alquiler o venta. Te ayudamos a
            encontrar el lugar ideal.
          </p>

          <a href="#propiedades">Ver propiedades</a>
        </div>
      </section>
      <section className="eslogan"><div ><p>CONVERTIMOS EN REALIDAD TUS SUEÑOS</p></div></section>
    </>
  )
}