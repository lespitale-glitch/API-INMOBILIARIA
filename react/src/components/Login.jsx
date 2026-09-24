import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, guardarSesion } from '../api'
import './Login.css'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const data = await api('/usuarios/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      guardarSesion(data)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="login-pagina">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src="/img/NT/NT_T_simple.png" alt="Nuevo Techo" className="login-logo" />
        <h1>Ingreso personal</h1>
        <p>Agentes y administradores de la inmobiliaria</p>

        {error && <p className="login-error">{error}</p>}

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>

        <Link to="/" className="login-volver">← Volver al sitio</Link>
      </form>
    </main>
  )
}
