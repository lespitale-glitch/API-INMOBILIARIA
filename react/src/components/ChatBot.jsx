import React, { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import './ChatBot.css'

const BIENVENIDA = {
  de: 'bot',
  texto: '¡Hola! Soy el asistente virtual de Nuevo Techo. ¿En qué puedo ayudarte hoy?',
}

const PLACEHOLDERS = {
  nombre: 'Escribí tu nombre…',
  contacto: 'email@ejemplo.com o 11 5566-7788…',
  mensaje: 'Contanos tu consulta…',
}

export const ChatBot = () => {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([BIENVENIDA])
  const [paso, setPaso] = useState('inicio') // inicio | nombre | contacto | mensaje | listo
  const [datos, setDatos] = useState({ tipoConsulta: '', nombre: '', contacto: '' })
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const finLista = useRef(null)

  useEffect(() => {
    finLista.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, abierto])

  const agregar = (de, contenido) => setMensajes((prev) => [...prev, { de, texto: contenido }])

  const elegirOpcion = (etiqueta) => {
    agregar('usuario', etiqueta)
    setDatos((prev) => ({ ...prev, tipoConsulta: etiqueta }))
    agregar('bot', '¡Perfecto! Para agilizar la consulta, decime tu nombre.')
    setPaso('nombre')
  }

  const finalizar = async (mensajeConsulta) => {
    setPaso('listo')
    setEnviando(true)
    const esEmail = datos.contacto.includes('@')
    try {
      await api('/contactos', {
        method: 'POST',
        body: JSON.stringify({
          nombre: datos.nombre,
          ...(esEmail ? { email: datos.contacto } : { telefono: datos.contacto }),
          mensaje: `${datos.tipoConsulta} — ${mensajeConsulta}`,
          origen: 'ChatBot',
        }),
      })
      agregar('bot', '¡Listo! Tu consulta quedó registrada. Un asesor de Nuevo Techo se pondrá en contacto con vos a la brevedad.')
    } catch {
      agregar('bot', 'Ups, no pudimos enviar la consulta. Volvé a escribir el mensaje y probá de nuevo.')
      setPaso('mensaje')
    } finally {
      setEnviando(false)
    }
  }

  const enviarPaso = (e) => {
    e.preventDefault()
    const valor = texto.trim()
    if (!valor || enviando) return
    agregar('usuario', valor)
    setTexto('')

    if (paso === 'nombre') {
      setDatos((prev) => ({ ...prev, nombre: valor }))
      agregar('bot', `¡Hola ${valor}! Dejame tu email o teléfono para poder responderte.`)
      setPaso('contacto')
    } else if (paso === 'contacto') {
      setDatos((prev) => ({ ...prev, contacto: valor }))
      agregar('bot', 'Genial. Contanos brevemente tu consulta o qué propiedad te interesa.')
      setPaso('mensaje')
    } else if (paso === 'mensaje') {
      finalizar(valor)
    }
  }

  const reiniciar = () => {
    setMensajes([BIENVENIDA])
    setPaso('inicio')
    setDatos({ tipoConsulta: '', nombre: '', contacto: '' })
    setTexto('')
  }

  return (
    <div className="chatbot">
      {abierto && (
        <div className="chatbot-dialogo" role="dialog" aria-label="Asistente virtual de Nuevo Techo">
          <header className="chatbot-header">
            <div>
              <strong>Asistente Nuevo Techo</strong>
              <span>Respuesta automática</span>
            </div>
            <div className="chatbot-header-botones">
              <button type="button" title="Reiniciar conversación" aria-label="Reiniciar conversación" onClick={reiniciar}>
                ↺
              </button>
              <button type="button" title="Cerrar chat" aria-label="Cerrar chat" onClick={() => setAbierto(false)}>
                ✕
              </button>
            </div>
          </header>

          <div className="chatbot-mensajes">
            {mensajes.map((m, i) => (
              <p key={i} className={`chatbot-mensaje chatbot-mensaje--${m.de}`}>{m.texto}</p>
            ))}

            {paso === 'inicio' && (
              <div className="chatbot-opciones">
                <button type="button" onClick={() => elegirOpcion('Tasación / Cotización')}>
                  Tasación / Cotización
                </button>
                <button type="button" onClick={() => elegirOpcion('Consulta de propiedad')}>
                  Consulta de propiedad
                </button>
              </div>
            )}

            <div ref={finLista} />
          </div>

          {(paso === 'nombre' || paso === 'contacto' || paso === 'mensaje') && (
            <form className="chatbot-input" onSubmit={enviarPaso}>
              <input
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={PLACEHOLDERS[paso]}
                disabled={enviando}
                autoFocus
              />
              <button type="submit" disabled={enviando || !texto.trim()}>
                {enviando ? '…' : 'Enviar'}
              </button>
            </form>
          )}

          {paso === 'listo' && (
            <div className="chatbot-input chatbot-listo">
              <button type="button" onClick={reiniciar}>Hacer otra consulta</button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="chatbot-boton"
        aria-label={abierto ? 'Cerrar chat' : 'Abrir chat con el asistente'}
        onClick={() => setAbierto((v) => !v)}
      >
        {abierto ? '✕' : '💬'}
      </button>
    </div>
  )
}
