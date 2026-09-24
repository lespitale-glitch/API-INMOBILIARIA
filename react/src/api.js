// Cliente pequeño de la API: agrega /api, JSON y Authorization del token.
const CLAVE_SESION = 'nt_sesion'

export async function api(ruta, { headers, ...opciones } = {}) {
  const res = await fetch(`/api${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
  return data
}

export const getSesion = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION))
  } catch {
    return null
  }
}

export const guardarSesion = (sesion) => localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))

export const cerrarSesion = () => localStorage.removeItem(CLAVE_SESION)
