import api from './api'

const lugaresService = {
  // Obtener todos los lugares
  getAll: async () => {
    try {
      const response = await api.get('/lugares-turisticos/lista')
      return response.data
    } catch (error) {
      console.error('Error al obtener lugares:', error)
      throw error
    }
  },

  // Obtener un lugar por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/lugares-turisticos/obtener/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener lugar:', error)
      throw error
    }
  },

  // Crear nuevo lugar
  create: async (lugar) => {
    try {
      const response = await api.post('/lugares-turisticos/crear', lugar)
      return response.data
    } catch (error) {
      console.error('Error al crear lugar:', error)
      throw error
    }
  },

  // Actualizar lugar existente
  update: async (id, lugar) => {
    try {
      const response = await api.put(`/lugares-turisticos/actualizar/${id}`, lugar)
      return response.data
    } catch (error) {
      console.error('Error al actualizar lugar:', error)
      throw error
    }
  },

  // Eliminar lugar
  delete: async (id) => {
    try {
      const response = await api.delete(`/lugares-turisticos/eliminar/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar lugar:', error)
      throw error
    }
  },

  // Buscar lugar por nombre (para comandos de voz)
  buscarPorNombre: async (nombre, lugares) => {
    // Búsqueda local primero (más rápido)
    if (lugares && lugares.length > 0) {
      return lugares.find(l =>
        l.nombreLugar.toLowerCase().includes(nombre.toLowerCase())
      )
    }
    return null
  }
}

export default lugaresService
