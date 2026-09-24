import React from 'react'
import './Navbar.css'

export const Navbar = ({ isMenuOpen, onMenuToggle }) => {
  return (
    <header>
      <a href="#home" className="logo">
        <img
          src="/img/NT/NT_T_simple.png"
          alt="Logo Nuevo Techo"
        />
      </a>
      <button className="menu-toggle" id="menu-toggle" onClick={onMenuToggle}>
        ☰
      </button>
      <nav id="menu" className={isMenuOpen ? 'activo' : ''}>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#propiedades">Destacadas</a></li>
          <li><a href="#alquiler">Alquiler</a></li>
          <li><a href="#venta">Venta</a></li>
          <li><a href="#tasacion">Tasación</a></li>
        </ul>
      </nav>
    </header>
  )
}