import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { api, getSesion, cerrarSesion } from '../api'
import './Admin.css'

const FORM_INICIAL = {
  direccion: '',
  zona: '',
  ambientes: '',
  metros_cuadrados: '',
  precio: '',
  operacion: 'Venta',
  caracteristicas: '',
  imagenes: '',
  agente_id: '',
  tipo_id: '',
}

export const Admin = () => {
  const [usuarios, setUsuarios] = useState([])
  const [tipos, setTipos] = useState([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [mensaje, setMensaje] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()

  const sesion = getSesion()

  useEffect(() => {
    if (!sesion) return
    api('/usuarios').then(setUsuarios).catch(() => setUsuarios([]))
    api('/tipos-propiedad').then(setTipos).catch(() => setTipos([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!sesion) return <Navigate to="/login" replace />

  const cambiar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }))

  const salir = () => {
    cerrarSesion()
    navigate('/login')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje(null)
    setEnviando(true)
    try {
      const cuerpo = {
        ...form,
        caracteristicas: form.caracteristicas.split(',').map((c) => c.trim()).filter(Boolean),
        imagenes: form.imagenes.split('\n').map((i) => i.trim()).filter(Boolean),
      }
      await api('/properties', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
        headers: { Authorization: `Bearer ${sesion.token}` },
      })
      setMensaje({ tipo: 'ok', texto: '¡Propiedad publicada! Ya aparece en el sitio público.' })
      setForm(FORM_INICIAL)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
      if (/autorizado|sesión|sesion/i.test(err.message)) {
        cerrarSesion()
        navigate('/login')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="admin-pagina">
      <header className="admin-topbar">
        <div>
          <span className="admin-marca">Nuevo Techo · Panel</span>
          <span className="admin-usuario">{sesion.usuario.nombre} ({sesion.usuario.rol})</span>
        </div>
        <div className="admin-acciones">
          <Link to="/">Ver sitio público</Link>
          <button type="button" onClick={salir}>Cerrar sesión</button>
        </div>
      </header>

      <main className="admin-main">
        <h1>Añadir nueva propiedad</h1>
        <p className="admin-subtitulo">
          Los campos se guardan vía <code>POST /api/properties</code> y quedan visibles en el sitio público.
        </p>

        {mensaje && (
          <p className={`admin-mensaje admin-mensaje--${mensaje.tipo}`}>
            {mensaje.texto}{' '}
            {mensaje.tipo === 'ok' && <Link to="/">Ver en el sitio →</Link>}
          </p>
        )}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-campo admin-campo--largo">
            <label htmlFor="admin-direccion">Dirección</label>
            <input id="admin-direccion" type="text" value={form.direccion} onChange={cambiar('direccion')} placeholder="Ej: Av. Santa Fe 3450" required />
          </div>

          <div className="admin-campo">
            <label htmlFor="admin-zona">Zona / Barrio</label>
            <input id="admin-zona" type="text" value={form.zona} onChange={cambiar('zona')} placeholder="Ej: Palermo" required />
          </div>

          <div className="admin-campo">
            <label htmlFor="admin-ambientes">Ambientes</label>
            <input id="admin-ambientes" type="number" min="1" value={form.ambientes} onChange={cambiar('ambientes')} required />
          </div>

          <div className="admin-campo">
            <label htmlFor="admin-metros">Metros cuadrados</label>
            <input id="admin-metros" type="number" min="1" value={form.metros_cuadrados} onChange={cambiar('metros_cuadrados')} required />
          </div>

          <div className="admin-campo">
            <label htmlFor="admin-precio">Precio (USD)</label>
            <input id="admin-precio" type="number" min="1" value={form.precio} onChange={cambiar('precio')} required />
          </div>

          <div className="admin-campo">
            <label htmlFor="admin-operacion">Operación</label>
            <select id="admin-operacion" value={form.operacion} onChange={cambiar('operacion')} required>
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
            </select>
          </div>

          <div className="admin-campo">
            <label htmlFor="admin-tipo">Tipo de propiedad</label>
            <select id="admin-tipo" value={form.tipo_id} onChange={cambiar('tipo_id')} required>
              <option value="">Seleccionar tipo…</option>
              {tipos.map((t) => (
                <option key={t._id} value={t._id}>{t.nombre_tipo}</option>
              ))}
            </select>
          </div>

          <div className="admin-campo">
            <label htmlFor="admin-agente">Agente a cargo</label>
            <select id="admin-agente" value={form.agente_id} onChange={cambiar('agente_id')} required>
              <option value="">Seleccionar agente…</option>
              {usuarios.map((u) => (
                <option key={u._id} value={u._id}>{u.nombre} ({u.rol})</option>
              ))}
            </select>
          </div>

          <div className="admin-campo admin-campo--largo">
            <label htmlFor="admin-caracteristicas">Características (separadas por coma)</label>
            <input id="admin-caracteristicas" type="text" value={form.caracteristicas} onChange={cambiar('caracteristicas')} placeholder="Balcón, Ascensor, Parrilla" />
          </div>

          <div className="admin-campo admin-campo--largo">
            <label htmlFor="admin-imagenes">Imágenes (una ruta por línea)</label>
            <textarea id="admin-imagenes" rows="3" value={form.imagenes} onChange={cambiar('imagenes')} placeholder={'/img/venta/casa.png\n/alquiler/depto.png'} />
          </div>

          <div className="admin-campo admin-campo--largo admin-botones">
            <button type="submit" disabled={enviando}>
              {enviando ? 'Publicando…' : 'Publicar propiedad'}
            </button>
            <button type="button" className="admin-borrar" onClick={() => { setForm(FORM_INICIAL); setMensaje(null) }}>
              Borrar
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
