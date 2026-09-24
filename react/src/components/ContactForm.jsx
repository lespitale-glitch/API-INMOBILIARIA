import React, { useEffect, useState } from 'react'
import { api } from '../api'
import './ContactForm.css'

export const ContactForm = () => {
  const [tipos, setTipos] = useState([])
  const [estado, setEstado] = useState(null)

  useEffect(() => {
    api('/tipos-propiedad')
      .then((d) => setTipos(Array.isArray(d) ? d : []))
      .catch(() => setTipos([]))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEstado(null)
    const fd = new FormData(e.target)
    const tipoNombre = fd.get('tipo')
    const tipoId = tipos.find((t) => t.nombre_tipo === tipoNombre)?._id

    const cuerpo = {
      nombre: fd.get('nombre'),
      email: fd.get('email'),
      telefono: fd.get('telefono') || undefined,
      zona: fd.get('zona') || undefined,
      metros: fd.get('metros') || undefined,
      mensaje: fd.get('mensaje') || undefined,
      acepta: fd.get('acepta') === 'on',
      ...(tipoId ? { tipo_id: tipoId } : { tipo: tipoNombre }),
    }

    try {
      await api('/contactos', { method: 'POST', body: JSON.stringify(cuerpo) })
      setEstado({ tipo: 'ok', texto: '¡Gracias! Recibimos tu consulta y te contactaremos a la brevedad.' })
      e.target.reset()
    } catch (err) {
      setEstado({ tipo: 'error', texto: err.message })
    }
  }

  return (
    /* Formulario de tasación, obligatorio en el TP - copiado de index.html original */
    <section id="tasacion">
      <h2>Contacto - Tasaciónes</h2>

      {estado && <p className={`contacto-mensaje contacto-mensaje--${estado.tipo}`}>{estado.texto}</p>}

      <form onSubmit={handleSubmit}>
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
