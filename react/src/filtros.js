// Filtro compartido entre el Hero/App y los PropertyList
export const coincideFiltros = (prop, filtros = {}) => {
  if (filtros.operacion && prop.operacion !== filtros.operacion) return false
  if (filtros.tipo && prop.tipo_id?._id !== filtros.tipo) return false
  if (filtros.zona) {
    const texto = filtros.zona.trim().toLowerCase()
    const enZona = (prop.zona || '').toLowerCase().includes(texto)
    const enDireccion = (prop.direccion || '').toLowerCase().includes(texto)
    if (!enZona && !enDireccion) return false
  }
  return true
}
