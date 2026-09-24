import React from 'react'
import './ContactForm.css'

export const ContactForm = () => {
  return (
    /* Formulario de tasación, obligatorio en el TP - copiado de index.html original */
    <section id="tasacion">
      <h2>Contacto - Tasaciónes</h2>

      <form>
        <label htmlFor="nombre">Nombre</label>
        <input type="text" id="nombre" name="nombre" required />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="telefono">Teléfono</label>
        <input type="tel" id="telefono" name="telefono" />

        <label htmlFor="tipo">Tipo de propiedad</label>
        <select id="tipo" name="tipo">
          <option>Casa</option>
          <option>Departamento</option>
          <option>Oficina</option>
          <option>Otro</option>
        </select>

        <label htmlFor="zona">Zona</label>
        <input type="text" id="zona" name="zona" />

        <label htmlFor="metros">Metros cuadrados</label>
        <input type="number" id="metros" name="metros" />

        <div className="checkbox">
          <input type="checkbox" id="acepta" name="acepta" />
          <label htmlFor="acepta">Quiero recibir novedades y promociones</label>
        </div>

        <label htmlFor="mensaje">Comentario</label>
        <textarea id="mensaje" name="mensaje"></textarea>

        <div className="botones-formulario">
          <button type="submit">Enviar</button>
          <button type="reset">Borrar</button>
        </div>
      </form>
    </section>
  )
}