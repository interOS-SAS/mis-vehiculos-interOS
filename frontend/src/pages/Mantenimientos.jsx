import { useState, useEffect } from 'react'
import { obtenerMantenimientos } from '../services/api'

export default function Mantenimientos() {
  const [mantenimientos, setMantenimientos] = useState([])

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data } = await obtenerMantenimientos({ limite: 20 })
      setMantenimientos(data.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mantenimientos</h1>
      <div className="card">
        <div className="space-y-3">
          {mantenimientos.map((mant) => (
            <div key={mant.id} className="p-4 bg-gray-50 rounded">
              <div className="flex justify-between mb-2">
                <p className="font-semibold">{mant.placa}</p>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {mant.tipo_mantenimiento}
                </span>
              </div>
              <p className="text-sm text-gray-600">{mant.descripcion}</p>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Km: {mant.kilometraje_realizado?.toLocaleString()}</span>
                <span>{new Date(mant.fecha_mantenimiento).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
