import { useState, useEffect } from 'react'
import { obtenerVehiculos } from '../services/api'

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarVehiculos()
  }, [])

  const cargarVehiculos = async () => {
    try {
      const { data } = await obtenerVehiculos()
      setVehiculos(data.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) return <div>Cargando...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Vehículos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehiculos.map((vehiculo) => (
          <div key={vehiculo.id} className="card">
            <h3 className="text-xl font-bold mb-2">{vehiculo.placa}</h3>
            <p className="text-gray-600">{vehiculo.marca} {vehiculo.modelo}</p>
            <p className="text-sm text-gray-500">Año: {vehiculo.anio}</p>
            <p className="text-sm text-gray-500">Km: {vehiculo.kilometraje_actual?.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
