import { useState, useEffect } from 'react'
import { getStats, getRecords, getMySessions } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logoutUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getMySessions()])
      .then(([statsRes, sessionsRes]) => {
        setStats(statsRes.data)
        setSessions(sessionsRes.data.slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Calistenia App</h1>
            <p className="text-xs text-gray-500">{user?.email} · {user?.role}</p>
          </div>
          <button
            onClick={logoutUser}
            className="text-sm text-gray-500 hover:text-red-500 transition"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Sesiones totales</p>
            <p className="text-3xl font-bold text-primary">{stats?.total_sessions ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Series totales</p>
            <p className="text-3xl font-bold text-secondary">{stats?.total_sets ?? 0}</p>
          </div>
        </div>

        {/* Últimas sesiones */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Últimas sesiones</h2>
            <a href="/workout/new" className="text-xs text-primary font-medium">+ Nueva</a>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No hay sesiones todavía</p>
              <a href="/workout/new" className="text-primary text-sm font-medium mt-2 block">
                Registrá tu primer entrenamiento
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Sesión #{session.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.duration_minutes ? `${session.duration_minutes} min` : 'Sin duración'} · {session.sets?.length ?? 0} series
                    </p>
                  </div>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                    ✓ Completada
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 gap-3">
          <a href="/workout/new" className="bg-primary text-white rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">💪</p>
            <p className="text-sm font-medium">Registrar entrenamiento</p>
          </a>
          <a href="/exercises" className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">📋</p>
            <p className="text-sm font-medium text-gray-700">Ver ejercicios</p>
          </a>
        </div>
      </div>
    </div>
  )
}