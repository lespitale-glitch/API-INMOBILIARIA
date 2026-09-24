import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { PropertyList } from './components/PropertyList'
import { coincideFiltros } from './filtros'
import { ContactForm } from './components/ContactForm'
import { Footer } from './components/Footer'
import { Login } from './components/Login'
import { AdminPanel } from './components/AdminPanel'
import './App.css'

const FILTROS_INICIALES = { tipo: '', operacion: '', zona: '' }

function Home() {
  const [menuActive, setMenuActive] = useState(false)
  const [tipos, setTipos] = useState([])
  const [propiedades, setPropiedades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  const toggleMenu = () => setMenuActive((prev) => !prev)

  // Se refresca en cada montaje: al volver de /admin las altas nuevas aparecen ya
  useEffect(() => {
    fetch('/api/tipos-propiedad')
      .then((r) => r.json())
      .then((d) => setTipos(Array.isArray(d) ? d : []))
      .catch(() => setTipos([]))

    fetch('/api/properties')
      .then((r) => r.json())
      .then((d) => setPropiedades(Array.isArray(d) ? d : []))
      .catch(() => setPropiedades([]))
      .finally(() => setCargando(false))
  }, [])

  const cambiarFiltro = (parciales) => setFiltros((prev) => ({ ...prev, ...parciales }))

  const buscar = () => document.getElementById('propiedades')?.scrollIntoView({ behavior: 'smooth' })

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES)

  const hayFiltros = Boolean(filtros.tipo || filtros.operacion || filtros.zona.trim())
  const resultadosGlobales = propiedades.filter((prop) => coincideFiltros(prop, filtros)).length
  const sinResultados = !cargando && resultadosGlobales === 0

  return (
    <>
      <Navbar isMenuOpen={menuActive} onMenuToggle={toggleMenu} />

      <Hero tipos={tipos} filtros={filtros} onFiltroChange={cambiarFiltro} onBuscar={buscar} />

      {sinResultados ? (
        <section id="propiedades" className="sin-resultados">
          <div className="sin-resultados-caja">
            <h2>No encontramos propiedades que coincidan con tu búsqueda</h2>
            <p>Probá con otros filtros o explorá todas las propiedades disponibles.</p>
            <button type="button" onClick={limpiarFiltros}>
              {hayFiltros ? 'Limpiar filtros' : 'Ver todo'}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section id="propiedades">
            <h2>Propiedades destacadas</h2>
            <PropertyList category="destacadas" propiedades={propiedades} filtros={filtros} cargando={cargando} />
          </section>

          <section id="alquiler">
            <h2>Propiedades en alquiler</h2>
            <PropertyList category="alquiler" propiedades={propiedades} filtros={filtros} cargando={cargando} />
          </section>

          <section id="venta">
            <h2>Propiedades en venta</h2>
            <PropertyList category="venta" propiedades={propiedades} filtros={filtros} cargando={cargando} />
          </section>
        </>
      )}

      <ContactForm />

      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
