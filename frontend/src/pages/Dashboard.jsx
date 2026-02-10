import { useState, useEffect } from 'react'
import { obtenerResumenDashboard } from '../services/api'
import { Car, AlertTriangle, Wrench, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarResumen()
  }, [])

  const cargarResumen = async () => {
    try {
      const { data } = await obtenerResumenDashboard()
      setResumen(data.data)
    } catch (error) {
      console.error('Error cargando resumen:', error)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Total Vehículos</p>
              <p className="text-4xl font-bold">{resumen?.total_vehiculos || 0}</p>
            </div>
            <Car size={48} className="opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 mb-1">Alertas Pendientes</p>
              <p className="text-4xl font-bold">{resumen?.alertas_pendientes || 0}</p>
            </div>
            <AlertTriangle size={48} className="opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 mb-1">Próximos Mantenimientos</p>
              <p className="text-4xl font-bold">{resumen?.proximos_mantenimientos || 0}</p>
            </div>
            <Wrench size={48} className="opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">Estado General</p>
              <p className="text-2xl font-bold">Activo</p>
            </div>
            <TrendingUp size={48} className="opacity-80" />
          </div>
        </div>
      </div>

      {resumen?.alertas && resumen.alertas.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-yellow-500" />
            Alertas de Mantenimiento
          </h2>
          <div className="space-y-3">
            {resumen.alertas.map((alerta, index) => (
              <div
                key={index}
                className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {alerta.placa} - {alerta.marca} {alerta.modelo}
                    </p>
                    <p className="text-sm text-gray-600">
                      Km actual: {alerta.kilometraje_actual?.toLocaleString()} km
                      | Desde último cambio: {alerta.km_desde_ultimo_aceite?.toLocaleString()} km
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                    Cambio de aceite
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Vehículos Activos</h2>
          <div className="space-y-2">
            {resumen?.vehiculos?.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{vehiculo.placa}</p>
                  <p className="text-sm text-gray-600">
                    {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio})
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    vehiculo.estado_aceite === 'OK'
                      ? 'bg-green-100 text-green-800'
                      : vehiculo.estado_aceite === 'PROXIMO'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {vehiculo.estado_aceite}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Próximos Mantenimientos</h2>
          <div className="space-y-2">
            {resumen?.proximos?.slice(0, 5).map((mant, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold">{mant.placa}</p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      mant.estado === 'URGENTE'
                        ? 'bg-red-100 text-red-800'
                        : mant.estado === 'PROXIMO'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {mant.estado}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{mant.tipo_mantenimiento}</p>
                <p className="text-xs text-gray-500">
                  Faltan {mant.km_restantes} km
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
