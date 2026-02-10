import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Car, Gauge, Fuel, Wrench, LayoutDashboard, LogOut } from 'lucide-react'

export default function Layout() {
  const { usuario, logout } = useAuth()
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/vehiculos', icon: Car, label: 'Vehículos' },
    { path: '/kilometraje', icon: Gauge, label: 'Kilometraje' },
    { path: '/combustible', icon: Fuel, label: 'Combustible' },
    { path: '/mantenimientos', icon: Wrench, label: 'Mantenimientos' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">🚗 INTEROS Control</h1>
              <div className="hidden md:flex space-x-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-white/20'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block">{usuario?.nombre}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:block">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
