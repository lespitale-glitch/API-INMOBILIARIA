import React from 'react'
import './Hero.css'

export const Hero = ({ tipos, filtros, onFiltroChange, onBuscar }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onBuscar()
  }

  return (
    <>
      {/* Sección Home con imagen principal, presentación y buscador - index.html original */}
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

          <form className="buscador" onSubmit={handleSubmit}>
            <label htmlFor="buscador-tipo">Tipo de propiedad</label>
            <select
              id="buscador-tipo"
              value={filtros.tipo}
              onChange={(e) => onFiltroChange({ tipo: e.target.value })}
            >
              <option value="">Todos</option>
              {tipos.map((tipo) => (
                <option key={tipo._id} value={tipo._id}>
                  {tipo.nombre_tipo}
                </option>
              ))}
            </select>

            <label htmlFor="buscador-operacion">Operación</label>
            <select
              id="buscador-operacion"
              value={filtros.operacion}
              onChange={(e) => onFiltroChange({ operacion: e.target.value })}
            >
              <option value="">Todas</option>
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
            </select>

            <label htmlFor="buscador-zona">Zona / Barrio</label>
            <input
              id="buscador-zona"
              type="text"
              placeholder="Ej: Palermo"
              value={filtros.zona}
              onChange={(e) => onFiltroChange({ zona: e.target.value })}
            />

            <button type="submit">Buscar</button>
          </form>
        </div>
      </section>
      <section className="eslogan"><div ><p>CONVERTIMOS EN REALIDAD TUS SUEÑOS</p></div></section>
    </>
  )
}
