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
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-primary)'}}>

      {/* Header */}
      <div style={{backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/dashboard" style={{color: 'var(--text-secondary)', fontSize: '20px'}}>←</a>
          <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>Nueva sesión</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Info general */}
        <div className="card space-y-4">
          <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Información general</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Duración (min)</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="input"
                placeholder="45"
              />
            </div>
            <div>
              <label className="label">Calificación</label>
              <select
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="input"
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
            <label className="label">Notas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input"
              placeholder="¿Cómo te sentiste hoy?"
              rows={2}
              style={{resize: 'none'}}
            />
          </div>
        </div>

        {/* Series */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Series ({sets.length})</p>
            <button
              type="button"
              onClick={addSet}
              style={{color: 'var(--accent)', fontSize: '13px', fontWeight: '500'}}
            >
              + Agregar serie
            </button>
          </div>

          {sets.length === 0 && (
            <div className="text-center py-6" style={{borderTop: '1px solid var(--border)'}}>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                Tocá "Agregar serie" para empezar
              </p>
            </div>
          )}

          {sets.map((set, index) => (
            <div key={index} className="p-3 rounded-xl space-y-3"
              style={{backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)'}}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{color: 'var(--accent)'}}>Serie {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeSet(index)}
                  className="text-xs"
                  style={{color: 'var(--danger)'}}
                >
                  Eliminar
                </button>
              </div>

              <div>
                <label className="label">Ejercicio</label>
                <select
                  value={set.exercise_id}
                  onChange={e => updateSet(index, 'exercise_id', e.target.value)}
                  className="input"
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
                  <label className="label">Reps</label>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={e => updateSet(index, 'reps', e.target.value)}
                    className="input"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="label">Duración en segundos (holds)</label>
                  <input
                    type="number"
                    value={set.duration_seconds}
                    onChange={e => updateSet(index, 'duration_seconds', e.target.value)}
                    className="input"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : 'Guardar sesión'}
        </button>
      </form>
    </div>
  )
}