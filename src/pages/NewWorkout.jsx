import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExercises, createSession } from '../services/api'

export default function NewWorkout() {
  const [exercises, setExercises] = useState([])
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(5)
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getExercises().then(res => setExercises(res.data))
  }, [])

  const addSet = () => {
    setSets([...sets, { exercise_id: '', set_number: sets.length + 1, reps: '', duration_seconds: '', notes: '' }])
  }

  const updateSet = (index, field, value) => {
    const updated = [...sets]
    updated[index][field] = value
    setSets(updated)
  }

  const removeSet = (index) => {
    setSets(sets.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sets.length === 0) return alert('Agregá al menos una serie')
    setLoading(true)
    try {
      const payload = {
        duration_minutes: duration ? parseInt(duration) : null,
        notes,
        rating: parseInt(rating),
        sets: sets.map(s => ({
          exercise_id: parseInt(s.exercise_id),
          set_number: s.set_number,
          reps: s.reps ? parseInt(s.reps) : null,
          duration_seconds: s.duration_seconds ? parseInt(s.duration_seconds) : null,
          notes: s.notes || null
        }))
      }
      await createSession(payload)
      navigate('/dashboard')
    } catch (err) {
      alert('Error al guardar la sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600">←</a>
          <h1 className="text-lg font-bold text-gray-900">Nueva sesión</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Info general */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Información general</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duración (minutos)</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="45"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Calificación</label>
              <select
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={5}>⭐⭐⭐⭐⭐ Excelente</option>
                <option value={4}>⭐⭐⭐⭐ Muy bien</option>
                <option value={3}>⭐⭐⭐ Bien</option>
                <option value={2}>⭐⭐ Regular</option>
                <option value={1}>⭐ Malo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="¿Cómo te sentiste hoy?"
              rows={2}
            />
          </div>
        </div>

        {/* Series */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Series ({sets.length})</h2>
            <button type="button" onClick={addSet} className="text-xs text-primary font-medium">+ Agregar serie</button>
          </div>

          {sets.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">
              Tocá "Agregar serie" para empezar
            </p>
          )}

          {sets.map((set, index) => (
            <div key={index} className="border border-gray-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Serie {index + 1}</span>
                <button type="button" onClick={() => removeSet(index)} className="text-xs text-red-400">✕ Eliminar</button>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ejercicio</label>
                <select
                  value={set.exercise_id}
                  onChange={e => updateSet(index, 'exercise_id', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Seleccioná un ejercicio</option>
                  {exercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name} — {ex.category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Reps</label>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={e => updateSet(index, 'reps', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Segundos (si aplica)</label>
                  <input
                    type="number"
                    value={set.duration_seconds}
                    onChange={e => updateSet(index, 'duration_seconds', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded-2xl py-4 text-sm font-medium hover:bg-opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : '💪 Guardar sesión'}
        </button>
      </form>
    </div>
  )
}