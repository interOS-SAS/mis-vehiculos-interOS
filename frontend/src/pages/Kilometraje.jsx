import { useState, useEffect } from 'react'
import { obtenerRegistrosKilometraje, obtenerVehiculos, crearRegistroKilometraje } from '../services/api'

export default function Kilometraje() {
  const [registros, setRegistros] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [regRes, vehRes] = await Promise.all([
        obtenerRegistrosKilometraje({ limite: 20 }),
        obtenerVehiculos()
      ])
      setRegistros(regRes.data.data)
      setVehiculos(vehRes.data.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    try {
      await crearRegistroKilometraje(formData)
      setMostrarForm(false)
      cargarDatos()
    } catch (error) {
      alert('Error al guardar: ' + error.response?.data?.message)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Registros de Kilometraje</h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="btn-primary"
        >
          {mostrarForm ? 'Cancelar' : 'Nuevo Registro'}
        </button>
      </div>

      {mostrarForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Nuevo Registro</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Vehículo</label>
              <select name="vehiculo_id" className="input-field" required>
                <option value="">Seleccionar...</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2">Kilometraje</label>
              <input type="number" name="kilometraje" className="input-field" required />
            </div>
            <div>
              <label className="block mb-2">Foto del Odómetro</label>
              <input type="file" name="foto_odometro" className="input-field" accept="image/*" required />
            </div>
            <button type="submit" className="btn-primary">Guardar</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Historial</h2>
        <div className="space-y-2">
          {registros.map((reg) => (
            <div key={reg.id} className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{reg.placa}</p>
                  <p className="text-sm text-gray-600">{reg.kilometraje?.toLocaleString()} km</p>
                </div>
                <p className="text-sm text-gray-500">{new Date(reg.fecha_registro).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
