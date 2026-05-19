import { useState, useEffect } from 'react'
import { getExercises } from '../services/api'
import { useAuth } from '../context/AuthContext'

const categoryColors = {
  'Jalón': { bg: '#0f2d1a', color: '#22c55e', border: '#052e16' },
  'Empuje': { bg: '#1a1a2e', color: '#818cf8', border: '#1e1b4b' },
  'Core': { bg: '#2d1f00', color: '#f59e0b', border: '#1c1400' },
  'Piernas': { bg: '#1a0f2e', color: '#a78bfa', border: '#1e1b4b' },
}

const difficultyColors = {
  'Principiante': { color: '#22c55e' },
  'Intermedio': { color: '#f59e0b' },
  'Avanzado': { color: '#ef4444' },
}

export default function Exercises() {
  const [exercises, setExercises] = useState([])
  const [filtered, setFiltered] = useState([])
  const [category, setCategory] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    getExercises()
      .then(res => {
        setExercises(res.data)
        setFiltered(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (category === 'Todos') {
      setFiltered(exercises)
    } else {
      setFiltered(exercises.filter(ex => ex.category === category))
    }
  }, [category, exercises])

  const categories = ['Todos', ...new Set(exercises.map(ex => ex.category))]

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-primary)'}}>

      {/* Header */}
      <div style={{backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" style={{color: 'var(--text-secondary)', fontSize: '20px'}}>←</a>
            <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>Ejercicios</h1>
          </div>
          {user?.role === 'coach' && (
            <a href="/exercises/new" style={{color: 'var(--accent)', fontSize: '13px', fontWeight: '500'}}>+ Nuevo</a>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition"
              style={{
                backgroundColor: category === cat ? 'var(--accent)' : 'var(--bg-card)',
                color: category === cat ? '#000000' : 'var(--text-secondary)',
                border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center py-8" style={{color: 'var(--text-secondary)'}}>Cargando...</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(exercise => {
              const catColor = categoryColors[exercise.category] || { bg: 'var(--bg-card)', color: 'var(--text-secondary)', border: 'var(--border)' }
              const diffColor = difficultyColors[exercise.difficulty] || { color: 'var(--text-secondary)' }

              return (
                <div key={exercise.id} className="card flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{backgroundColor: catColor.bg, border: `1px solid ${catColor.border}`}}>
                      <span style={{color: catColor.color, fontSize: '16px'}}>
                        {exercise.category === 'Jalón' ? '↑' :
                         exercise.category === 'Empuje' ? '↓' :
                         exercise.category === 'Core' ? '◎' : '⬡'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>{exercise.name}</p>
                        {exercise.is_skill && (
                          <span className="badge-green">Skill</span>
                        )}
                      </div>
                      {exercise.description && (
                        <p className="text-xs mt-0.5" style={{color: 'var(--text-secondary)'}}>{exercise.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{backgroundColor: catColor.bg, color: catColor.color}}>
                      {exercise.category}
                    </span>
                    <span className="text-xs font-medium" style={{color: diffColor.color}}>
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}