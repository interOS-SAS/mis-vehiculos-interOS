import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// AUTH
export const login = (email, password) => 
  api.post('/auth/login', { email, password })

export const obtenerPerfil = () => 
  api.get('/auth/perfil')

// VEHICULOS
export const obtenerVehiculos = (params) => 
  api.get('/vehiculos', { params })

export const obtenerVehiculo = (id) => 
  api.get(`/vehiculos/${id}`)

export const crearVehiculo = (formData) => 
  api.post('/vehiculos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const actualizarVehiculo = (id, formData) => 
  api.put(`/vehiculos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const eliminarVehiculo = (id) => 
  api.delete(`/vehiculos/${id}`)

// KILOMETRAJE
export const obtenerRegistrosKilometraje = (params) => 
  api.get('/kilometraje', { params })

export const crearRegistroKilometraje = (formData) => 
  api.post('/kilometraje', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

// COMBUSTIBLE
export const obtenerRegistrosCombustible = (params) => 
  api.get('/combustible', { params })

export const crearRegistroCombustible = (formData) => 
  api.post('/combustible', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

// MANTENIMIENTOS
export const obtenerMantenimientos = (params) => 
  api.get('/mantenimientos', { params })

export const obtenerProximosMantenimientos = () => 
  api.get('/mantenimientos/proximos')

export const crearMantenimiento = (data) => 
  api.post('/mantenimientos', data)

// DASHBOARD
export const obtenerResumenDashboard = () => 
  api.get('/dashboard/resumen')

export default api
