import { useState, useEffect } from 'react'
import { getExercises } from '../services/api'

const categoryColors = {
  push: 'bg-blue-50 text-blue-600',
  pull: 'bg-purple-50 text-purple-600',
  core: 'bg-yellow-50 text-yellow-600',
  legs: 'bg-green-50 text-green-600',
  skill: 'bg-red-50 text-red-600',
}

const difficultyColors = {
  beginner: 'bg-green-50 text-green-600',
  intermediate: 'bg-yellow-50 text-yellow-600',
  advanced: 'bg-red-50 text-red-600',
}

export default function Exercises() {
  const [exercises, setExercises] = useState([])
  const [filtered, setFiltered] = useState([])
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExercises()
      .then(res => {
        setExercises(res.data)
        setFiltered(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (category === 'all') {
      setFiltered(exercises)
    } else {
      setFiltered(exercises.filter(ex => ex.category === category))
    }
  }, [category, exercises])

  const categories = ['all', ...new Set(exercises.map(ex => ex.category))]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600">←</a>
          <h1 className="text-lg font-bold text-gray-900">Ejercicios</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Cargando...</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(exercise => (
              <div key={exercise.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{exercise.name}</h3>
                      {exercise.is_skill && (
                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">⭐ Skill</span>
                      )}
                    </div>
                    {exercise.description && (
                      <p className="text-xs text-gray-500">{exercise.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 ml-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[exercise.category] || 'bg-gray-50 text-gray-600'}`}>
                      {exercise.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[exercise.difficulty] || 'bg-gray-50 text-gray-600'}`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}