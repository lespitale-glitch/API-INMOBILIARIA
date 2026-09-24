import React, { useState } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { PropertyList } from './components/PropertyList'
import { ContactForm } from './components/ContactForm'
import { Footer } from './components/Footer'
import './App.css'

function App() {
  const [menuActive, setMenuActive] = useState(false)

  const toggleMenu = () => setMenuActive(prev => !prev)

  return (
    <>
      <Navbar
        isMenuOpen={menuActive}
        onMenuToggle={toggleMenu}
      />

      <Hero />

      <section id="propiedades">
        <h2>Propiedades destacadas</h2>
        <PropertyList category="destacadas" />
      </section>

      <section id="alquiler">
        <h2>Propiedades en alquiler</h2>
        <PropertyList category="alquiler" />
      </section>

      <section id="venta">
        <h2>Propiedades en venta</h2>
        <PropertyList category="venta" />
      </section>

      <ContactForm />

      <Footer />
    </>
  )
}

export default App