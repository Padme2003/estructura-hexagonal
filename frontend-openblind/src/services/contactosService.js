import api from './api'

const contactosService = {
  // Obtener todos los contactos de un cliente
  getAll: async (clienteId) => {
    try {
      const response = await api.get(`/contactos-emergencia/cliente/${clienteId}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener contactos:', error)
      throw error
    }
  },

  // Obtener un contacto por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/contactos-emergencia/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener contacto:', error)
      throw error
    }
  },

  // Obtener contacto prioritario (para emergencias)
  getPrioritario: async (clienteId) => {
    try {
      const response = await api.get(`/contactos-emergencia/prioritario/${clienteId}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener contacto prioritario:', error)
      throw error
    }
  },

  // Buscar contacto por nombre (para comandos de voz)
  buscarPorNombre: async (clienteId, nombre) => {
    try {
      const response = await api.get(`/contactos-emergencia/buscar/${clienteId}/${nombre}`)
      return response.data
    } catch (error) {
      console.error('Error al buscar contacto:', error)
      throw error
    }
  },

  // Crear nuevo contacto
  create: async (contacto) => {
    try {
      const response = await api.post('/contactos-emergencia/', contacto)
      return response.data
    } catch (error) {
      console.error('Error al crear contacto:', error)
      throw error
    }
  },

  // Actualizar contacto existente
  update: async (id, contacto) => {
    try {
      const response = await api.put(`/contactos-emergencia/${id}`, contacto)
      return response.data
    } catch (error) {
      console.error('Error al actualizar contacto:', error)
      throw error
    }
  },

  // Eliminar contacto
  delete: async (id) => {
    try {
      const response = await api.delete(`/contactos-emergencia/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar contacto:', error)
      throw error
    }
  },

  // Función helper para iniciar llamada
  llamar: (telefono) => {
    // Limpiar formato del teléfono (quitar espacios, guiones, etc.)
    const telefonoLimpio = telefono.replace(/[\s\-()]/g, '')
    window.location.href = `tel:${telefonoLimpio}`
  }
}

export default contactosService
