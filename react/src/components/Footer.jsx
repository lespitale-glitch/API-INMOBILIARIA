import React from 'react'
import './Footer.css'

export const Footer = () => {
  return (
    /* Footer con datos de contacto - copiado de index.html original */
    <footer>
      <div className="info-footer">
        {/* Teléfono: al hacer click intenta llamar */}
        <p>
          <a href="tel:+541112345678">
            <i className="bi bi-telephone-fill"></i> +54 11 1234-5678
          </a>
        </p>

        {/* Email: al hacer click abre el programa de correo */}
        <p>
          <a href="mailto:contacto@nuevotecho.com">
            <i className="bi bi-envelope-fill"></i> contacto@nuevotecho.com
          </a>
        </p>
      </div>

      <div className="redes-sociales">
        <a href="/img/redes/facebook.jpeg" target="_blank" rel="noopener noreferrer">
          <i className="bi bi-facebook"></i>
        </a>

        <a href="/img/redes/instagram.jpeg" target="_blank" rel="noopener noreferrer">
          <i className="bi bi-instagram"></i>
        </a>

        <a href="https://www.whatsapp.com/?lang=es" target="_blank" rel="noopener noreferrer">
          <i className="bi bi-whatsapp"></i>
        </a>
      </div>

      <p className="copyright">© 2026 Nuevo Techo Propiedades y Hogar</p>
    </footer>
  )
}