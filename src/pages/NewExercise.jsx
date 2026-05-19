import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../services/api'

export default function NewExercise() {
  const [form, setForm] = useState({
    name: '',
    category: 'Jalón',
    difficulty: 'Principiante',
    description: '',
    is_skill: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/exercises/', form)
      navigate('/exercises')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear el ejercicio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/exercises" className="text-gray-400 hover:text-gray-600">←</a>
          <h1 className="text-lg font-bold text-gray-900">Nuevo ejercicio</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">

          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: Muscle-up"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Categoría</label>
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Jalón">Jalón</option>
              <option value="Empuje">Empuje</option>
              <option value="Core">Core</option>
              <option value="Piernas">Piernas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Dificultad</label>
            <select
              value={form.difficulty}
              onChange={e => setForm({...form, difficulty: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Descripción del ejercicio..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_skill"
              checked={form.is_skill}
              onChange={e => setForm({...form, is_skill: e.target.checked})}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="is_skill" className="text-sm text-gray-700">⭐ Es un skill (muscle-up, front lever, etc.)</label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded-2xl py-4 text-sm font-medium hover:bg-opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : '+ Crear ejercicio'}
        </button>
      </form>
    </div>
  )
}