import axios from 'axios'

// Cliente Axios configurado
const api = axios.create({
  baseURL: 'http://localhost:8888',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Interceptor para requests (agregar token si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses (manejar errores globales)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('authToken')
      localStorage.removeItem('userCedula')
      // Opcional: redirigir al login
    }
    return Promise.reject(error)
  }
)

export default api
