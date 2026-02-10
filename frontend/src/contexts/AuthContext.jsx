import { createContext, useState, useContext, useEffect } from 'react'
import { login as loginApi, obtenerPerfil } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    verificarAutenticacion()
  }, [])

  const verificarAutenticacion = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const { data } = await obtenerPerfil()
        setUsuario(data.data)
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
      }
    }
    setCargando(false)
  }

  const login = async (email, password) => {
    try {
      const { data } = await loginApi(email, password)
      const { token, usuario } = data.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))
      setUsuario(usuario)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
    window.location.href = '/login'
  }

  const value = {
    usuario,
    cargando,
    login,
    logout,
    isAuthenticated: !!usuario
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
