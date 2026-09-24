import React, { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { api, getSesion, cerrarSesion } from '../api'
import './AdminPanel.css'

const FORM_INICIAL = {
  direccion: '',
  zona: '',
  ambientes: '',
  metros_cuadrados: '',
  precio: '',
  operacion: 'Venta',
  caracteristicas: '',
  agente_id: '',
  tipo_id: '',
}

const ETIQUETAS_SUGERIDAS = ['Frente', 'Patio', 'Balcón', 'Cocina', 'Ambiente Principal']

const leerDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(lector.result)
    lector.onerror = () => reject(new Error('No se pudo leer el archivo'))
    lector.readAsDataURL(file)
  })

export const AdminPanel = () => {
  const [usuarios, setUsuarios] = useState([])
  const [tipos, setTipos] = useState([])
  const [propiedades, setPropiedades] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)
  const [imagenes, setImagenes] = useState([]) // { id, nombre, etiqueta, url, subiendo, error }
  const [arrastrando, setArrastrando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [eliminando, setEliminando] = useState(null)
  const inputArchivo = useRef(null)
  const navigate = useNavigate()

  const sesion = getSesion()

  const cargarPropiedades = () =>
    api('/properties').then(setPropiedades).catch(() => setPropiedades([]))

  useEffect(() => {
    if (!sesion) return
    api('/usuarios').then(setUsuarios).catch(() => setUsuarios([]))
    api('/tipos-propiedad').then(setTipos).catch(() => setTipos([]))
    cargarPropiedades()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!sesion) return <Navigate to="/login" replace />

  const cambiar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }))

  const salir = () => {
    cerrarSesion()
    navigate('/login')
  }

  const subirArchivo = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setImagenes((prev) => [...prev, { id, nombre: file.name, etiqueta: '', url: '', subiendo: true }])
    try {
      const data = await leerDataUrl(file)
      const res = await api('/imagenes', {
        method: 'POST',
        body: JSON.stringify({ nombre: file.name, data }),
        headers: { Authorization: `Bearer ${sesion.token}` },
      })
      setImagenes((prev) => prev.map((i) => (i.id === id ? { ...i, url: res.url, subiendo: false } : i)))
    } catch (err) {
      if (/autorizado/i.test(err.message)) {
        cerrarSesion()
        navigate('/login')
        return
      }
      setImagenes((prev) => prev.map((i) => (i.id === id ? { ...i, subiendo: false, error: err.message } : i)))
    }
  }

  const recibirArchivos = (lista) => Array.from(lista || []).forEach(subirArchivo)

  const quitarImagen = (id) => setImagenes((prev) => prev.filter((i) => i.id !== id))

  const cambiarEtiqueta = (id, etiqueta) =>
    setImagenes((prev) => prev.map((i) => (i.id === id ? { ...i, etiqueta } : i)))

  const eliminarPropiedad = async (prop) => {
    const confirmado = window.confirm('¿Seguro que querés eliminar esta propiedad de la base de datos?')
    if (!confirmado) return
    setEliminando(prop._id)
    try {
      await api(`/properties/${prop._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sesion.token}` },
      })
      await cargarPropiedades()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
      if (/autorizado|sesión|sesion/i.test(err.message)) {
        cerrarSesion()
        navigate('/login')
      }
    } finally {
      setEliminando(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje(null)
    if (imagenes.some((i) => i.subiendo)) {
      setMensaje({ tipo: 'error', texto: 'Esperá a que terminen de subirse las imágenes.' })
      return
    }
    setEnviando(true)
    try {
      const subidas = imagenes.filter((i) => i.url && !i.error)
      const cuerpo = {
        ...form,
        caracteristicas: form.caracteristicas.split(',').map((c) => c.trim()).filter(Boolean),
        imagenes: subidas.map((i) => i.url),
        imagenes_etiquetas: subidas.map((i) => i.etiqueta || ''),
      }
      await api('/properties', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
        headers: { Authorization: `Bearer ${sesion.token}` },
      })
      setMensaje({ tipo: 'ok', texto: '¡Propiedad publicada! Ya aparece en el sitio público.' })
      setForm(FORM_INICIAL)
      setImagenes([])
      cargarPropiedades()
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

  const textoBusqueda = busqueda.trim().toLowerCase()
  const propiedadesFiltradas = textoBusqueda
    ? propiedades.filter((p) => {
        const tipo = (p.tipo_id && p.tipo_id.nombre_tipo) || ''
        return (
          (p.direccion || '').toLowerCase().includes(textoBusqueda) ||
          (p.zona || '').toLowerCase().includes(textoBusqueda) ||
          tipo.toLowerCase().includes(textoBusqueda)
        )
      })
    : propiedades

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
            <label>Imágenes (arrastrá y soltá, o hacé clic para elegir)</label>
            <div
              className={`admin-drop${arrastrando ? ' admin-drop--activo' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => inputArchivo.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputArchivo.current?.click() }}
              onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => {
                e.preventDefault()
                setArrastrando(false)
                recibirArchivos(e.dataTransfer.files)
              }}
            >
              <strong>Arrastrá las imágenes acá</strong>
              <span>o hacé clic para seleccionarlas (png, jpg, gif, webp)</span>
              <input
                ref={inputArchivo}
                type="file"
                hidden
                multiple
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={(e) => { recibirArchivos(e.target.files); e.target.value = '' }}
              />
            </div>

            {imagenes.length > 0 && (
              <ul className="admin-miniaturas">
                {imagenes.map((img) => (
                  <li key={img.id} className="admin-mini">
                    {img.url && !img.subiendo ? (
                      <img src={img.url} alt={img.etiqueta || img.nombre} />
                    ) : (
                      <div className={`admin-mini-espera${img.error ? ' admin-mini-espera--error' : ''}`}>
                        {img.error ? 'Error' : 'Subiendo…'}
                      </div>
                    )}
                    <div className="admin-mini-datos">
                      <span className="admin-mini-nombre" title={img.nombre}>{img.nombre}</span>
                      <input
                        list="etiquetas-sugeridas"
                        placeholder="Etiqueta (ej: Frente)"
                        value={img.etiqueta}
                        disabled={img.subiendo}
                        onChange={(e) => cambiarEtiqueta(img.id, e.target.value)}
                      />
                      <button type="button" className="admin-mini-quitar" onClick={() => quitarImagen(img.id)}>
                        Quitar
                      </button>
                      {img.error && <span className="admin-mini-error">{img.error}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <datalist id="etiquetas-sugeridas">
              {ETIQUETAS_SUGERIDAS.map((et) => (
                <option key={et} value={et} />
              ))}
            </datalist>
          </div>

          <div className="admin-campo admin-campo--largo admin-botones">
            <button type="submit" disabled={enviando}>
              {enviando ? 'Publicando…' : 'Publicar propiedad'}
            </button>
            <button type="button" className="admin-borrar" onClick={() => { setForm(FORM_INICIAL); setImagenes([]); setMensaje(null) }}>
              Borrar
            </button>
          </div>
        </form>

        <section className="admin-gestion">
          <h2>Gestión de Propiedades</h2>
          <p className="admin-subtitulo">
            {propiedades.length} {propiedades.length === 1 ? 'propiedad cargada' : 'propiedades cargadas'} · <code>GET /api/properties</code>
          </p>

          <div className="admin-busqueda">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar propiedad a eliminar por dirección, barrio o tipo..."
              aria-label="Buscar propiedad"
            />
          </div>

          <div className="admin-tabla">
            {propiedades.length === 0 && (
              <p className="admin-tabla-vacia">No hay propiedades cargadas.</p>
            )}
            {propiedades.length > 0 && propiedadesFiltradas.length === 0 && (
              <p className="admin-tabla-vacia">No hay propiedades que coincidan con tu búsqueda.</p>
            )}

            {propiedadesFiltradas.map((prop) => (
              <div className="admin-fila" key={prop._id}>
                <img
                  className="admin-fila-foto"
                  src={prop.imagenes?.[0] || '/img/destacadas/casa.jpeg'}
                  alt={prop.direccion}
                />
                <div className="admin-fila-datos">
                  <strong>{prop.direccion}</strong>
                  <span>
                    {prop.zona}
                    {prop.tipo_id?.nombre_tipo ? ` · ${prop.tipo_id.nombre_tipo}` : ''}
                    {prop.operacion ? ` · ${prop.operacion}` : ''}
                  </span>
                </div>
                <span className="admin-fila-precio">USD {Number(prop.precio).toLocaleString('es-AR')}</span>
                <button
                  type="button"
                  className="admin-fila-eliminar"
                  disabled={eliminando === prop._id}
                  onClick={() => eliminarPropiedad(prop)}
                >
                  {eliminando === prop._id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
