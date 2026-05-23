import { useState, useEffect } from 'react'
import { getStats, getMySessions, getMyAssignedPlans } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { user, logoutUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [assignedPlans, setAssignedPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getMySessions(), getMyAssignedPlans()])
      .then(([statsRes, sessionsRes, plansRes]) => {
        setStats(statsRes.data)
        setSessions(sessionsRes.data.slice(0, 5))
        setAssignedPlans(plansRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const chartData = sessions.map((s, i) => ({
    name: `S${sessions.length - i}`,
    series: s.sets?.length ?? 0,
    duracion: s.duration_minutes ?? 0
  })).reverse()

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-primary)'}}>
      <p style={{color: 'var(--text-secondary)'}}>Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-primary)'}}>

      {/* Header */}
      <div style={{backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent)'}}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>{user?.email}</p>
              <p className="text-xs capitalize" style={{color: 'var(--text-secondary)'}}>{user?.role === 'coach' ? 'Coach' : 'Atleta'}</p>
            </div>
          </div>
          <button onClick={logoutUser} className="text-sm" style={{color: 'var(--text-secondary)'}}>
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs mb-2" style={{color: 'var(--text-secondary)'}}>Sesiones totales</p>
            <p className="text-4xl font-bold" style={{color: 'var(--accent)'}}>{stats?.total_sessions ?? 0}</p>
          </div>
          <div className="card">
            <p className="text-xs mb-2" style={{color: 'var(--text-secondary)'}}>Series totales</p>
            <p className="text-4xl font-bold" style={{color: 'var(--text-primary)'}}>{stats?.total_sets ?? 0}</p>
          </div>
        </div>

        {/* Plan asignado */}
        {assignedPlans.length > 0 && (
          <div className="card">
            <p className="text-sm font-medium mb-3" style={{color: 'var(--text-primary)'}}>Mi plan actual</p>
            {assignedPlans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between py-2"
                style={{borderBottom: '1px solid var(--border)'}}>
                <div>
                  <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>{plan.name}</p>
                  <p className="text-xs mt-0.5" style={{color: 'var(--text-secondary)'}}>
                    {plan.difficulty} · {plan.duration_weeks} semanas
                  </p>
                </div>
                <span className="badge-green">Activo</span>
              </div>
            ))}
          </div>
        )}

        {/* Gráfico */}
        {sessions.length > 0 && (
          <div className="card">
            <p className="text-sm font-medium mb-4" style={{color: 'var(--text-primary)'}}>Últimas sesiones</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barGap={4}>
                <XAxis dataKey="name" tick={{fill: '#555555', fontSize: 11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill: '#555555', fontSize: 11}} axisLine={false} tickLine={false}/>
                <Tooltip
                  contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#ffffff'}}
                  cursor={{fill: '#2a2a2a'}}
                />
                <Bar dataKey="series" name="Series" fill="#22c55e" radius={[4,4,0,0]}/>
                <Bar dataKey="duracion" name="Minutos" fill="#2a2a2a" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Historial */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Historial reciente</p>
            <a href="/workout/new" style={{color: 'var(--accent)', fontSize: '12px', fontWeight: '500'}}>+ Nueva sesión</a>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm mb-3" style={{color: 'var(--text-secondary)'}}>No hay sesiones todavía</p>
              <a href="/workout/new" className="btn-primary" style={{display: 'inline-block', width: 'auto', padding: '8px 20px'}}>
                Registrá tu primer entrenamiento
              </a>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between py-3"
                  style={{borderBottom: '1px solid var(--border)'}}>
                  <div>
                    <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>
                      {session.notes?.startsWith('Circuito') ? '⏱️ Circuito' : '💪 Entrenamiento'}
                    </p>
                    <p className="text-xs mt-0.5" style={{color: 'var(--text-secondary)'}}>
                      {session.duration_minutes ? `${session.duration_minutes} min` : 'Sin duración'} · {session.sets?.length ?? 0} series
                    </p>
                  </div>
                  <span className="badge-green">Completada</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-3 gap-3">
          <a href="/workout/new" className="card col-span-2 flex items-center gap-3 hover:opacity-80 transition"
            style={{border: '1px solid var(--accent)', textDecoration: 'none'}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{backgroundColor: 'var(--accent-subtle)'}}>
              <span>💪</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Registrar entrenamiento</p>
              <p className="text-xs" style={{color: 'var(--text-secondary)'}}>Nueva sesión</p>
            </div>
          </a>
          <div className="flex flex-col gap-3">
            <a href="/exercises" className="card flex flex-col items-center justify-center py-3 hover:opacity-80 transition"
              style={{textDecoration: 'none'}}>
              <span className="text-xl mb-1">📋</span>
              <p className="text-xs" style={{color: 'var(--text-secondary)'}}>Ejercicios</p>
            </a>
            <a href="/progress" className="card flex flex-col items-center justify-center py-3 hover:opacity-80 transition"
              style={{textDecoration: 'none'}}>
              <span className="text-xl mb-1">📈</span>
              <p className="text-xs" style={{color: 'var(--text-secondary)'}}>Progreso</p>
            </a>
            <a href="/profile" className="card flex flex-col items-center justify-center py-3 hover:opacity-80 transition"
              style={{textDecoration: 'none'}}>
              <span className="text-xl mb-1">👤</span>
              <p className="text-xs" style={{color: 'var(--text-secondary)'}}>Perfil</p>
            </a>
            <a href="/circuit" className="card flex flex-col items-center justify-center py-3 hover:opacity-80 transition"
              style={{textDecoration: 'none'}}>
              <span className="text-xl mb-1">⏱️</span>
              <p className="text-xs" style={{color: 'var(--text-secondary)'}}>Circuito</p>
            </a>
          </div>
        </div>

        {user?.role === 'coach' && (
          <a href="/coach" className="card flex items-center gap-3 hover:opacity-80 transition"
            style={{textDecoration: 'none', borderColor: 'var(--accent)'}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{backgroundColor: 'var(--accent-subtle)'}}>
              <span>🏋️</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Panel del coach</p>
              <p className="text-xs" style={{color: 'var(--text-secondary)'}}>Gestionar atletas</p>
            </div>
          </a>
        )}
      </div>
    </div>
  )
}