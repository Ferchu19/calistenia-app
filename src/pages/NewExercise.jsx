import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-primary)'}}>

      {/* Header */}
      <div style={{backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/exercises" style={{color: 'var(--text-secondary)', fontSize: '20px'}}>←</a>
          <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>Nuevo ejercicio</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="card space-y-4">

          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="input"
              placeholder="Ej: Muscle-up"
              required
            />
          </div>

          <div>
            <label className="label">Categoría</label>
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              className="input"
            >
              <option value="Jalón">Jalón</option>
              <option value="Empuje">Empuje</option>
              <option value="Core">Core</option>
              <option value="Piernas">Piernas</option>
            </select>
          </div>

          <div>
            <label className="label">Dificultad</label>
            <select
              value={form.difficulty}
              onChange={e => setForm({...form, difficulty: e.target.value})}
              className="input"
            >
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="input"
              placeholder="Descripción del ejercicio..."
              rows={3}
              style={{resize: 'none'}}
            />
          </div>

          <div className="flex items-center gap-3 py-2" style={{borderTop: '1px solid var(--border)'}}>
            <input
              type="checkbox"
              id="is_skill"
              checked={form.is_skill}
              onChange={e => setForm({...form, is_skill: e.target.checked})}
              className="w-4 h-4"
              style={{accentColor: 'var(--accent)'}}
            />
            <label htmlFor="is_skill" className="text-sm" style={{color: 'var(--text-primary)'}}>
              Es un skill <span style={{color: 'var(--text-secondary)'}}>(muscle-up, front lever, etc.)</span>
            </label>
          </div>

          {error && <p className="text-sm" style={{color: 'var(--danger)'}}>{error}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : '+ Crear ejercicio'}
        </button>
      </form>
    </div>
  )
}