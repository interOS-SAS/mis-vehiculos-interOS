import { useState, useEffect } from 'react'
import { obtenerRegistrosCombustible } from '../services/api'

export default function Combustible() {
  const [registros, setRegistros] = useState([])

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data } = await obtenerRegistrosCombustible({ limite: 20 })
      setRegistros(data.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Registros de Combustible</h1>
      <div className="card">
        <div className="space-y-2">
          {registros.map((reg) => (
            <div key={reg.id} className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{reg.placa}</p>
                  <p className="text-sm text-gray-600">
                    {reg.litros}L - ${reg.costo_total?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{new Date(reg.fecha_carga).toLocaleDateString()}</p>
                  {reg.rendimiento_calculado && (
                    <p className="text-sm font-semibold text-green-600">
                      {reg.rendimiento_calculado.toFixed(1)} km/L
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
