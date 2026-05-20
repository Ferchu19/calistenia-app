import { useState, useEffect } from 'react'
import { getMySessions, getExercises } from '../services/api'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px'}}>
        <p style={{color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px'}}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{color: p.color, fontSize: '13px', fontWeight: '500'}}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Progress() {
  const [sessions, setSessions] = useState([])
  const [exercises, setExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMySessions(), getExercises()])
      .then(([sessionsRes, exercisesRes]) => {
        setSessions(sessionsRes.data)
        setExercises(exercisesRes.data)
        if (exercisesRes.data.length > 0) {
          setSelectedExercise(exercisesRes.data[0].id)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // Sesiones por semana
  const sessionsByWeek = () => {
    const weeks = {}
    sessions.forEach((s, i) => {
      const week = `S${sessions.length - i}`
      weeks[week] = (weeks[week] || 0) + 1
    })
    return Object.entries(weeks).slice(-8).map(([name, sesiones]) => ({ name, sesiones }))
  }

  // Volumen semanal (series totales)
  const volumeBySession = () => {
    return sessions.slice(-8).map((s, i) => ({
      name: `S${i + 1}`,
      series: s.sets?.length ?? 0,
      minutos: s.duration_minutes ?? 0
    }))
  }

  // Progreso de reps por ejercicio
  const repProgressByExercise = () => {
    if (!selectedExercise) return []
    const data = []
    sessions.slice().reverse().forEach((s, i) => {
      const setsForExercise = s.sets?.filter(set => set.exercise_id === parseInt(selectedExercise)) || []
      if (setsForExercise.length > 0) {
        const maxReps = Math.max(...setsForExercise.map(set => set.reps || 0))
        data.push({ name: `S${i + 1}`, reps: maxReps })
      }
    })
    return data
  }

  const selectedExerciseName = exercises.find(e => e.id === parseInt(selectedExercise))?.name || ''

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-primary)'}}>
      <p style={{color: 'var(--text-secondary)'}}>Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-primary)'}}>

      {/* Header */}
      <div style={{backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/dashboard" style={{color: 'var(--text-secondary)', fontSize: '20px'}}>←</a>
          <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>Mi progreso</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {sessions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-sm mb-2" style={{color: 'var(--text-secondary)'}}>No hay sesiones registradas todavía</p>
            <a href="/workout/new" style={{color: 'var(--accent)', fontSize: '13px', fontWeight: '500'}}>
              Registrá tu primer entrenamiento
            </a>
          </div>
        ) : (
          <>
            {/* Volumen por sesión */}
            <div className="card">
              <p className="text-sm font-medium mb-1" style={{color: 'var(--text-primary)'}}>Volumen por sesión</p>
              <p className="text-xs mb-4" style={{color: 'var(--text-secondary)'}}>Series y minutos por sesión</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={volumeBySession()} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false}/>
                  <XAxis dataKey="name" tick={{fill: '#555555', fontSize: 11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill: '#555555', fontSize: 11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#2a2a2a'}}/>
                  <Bar dataKey="series" name="Series" fill="#22c55e" radius={[4,4,0,0]}/>
                  <Bar dataKey="minutos" name="Minutos" fill="#1a3a2a" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Progreso de reps por ejercicio */}
            <div className="card">
              <p className="text-sm font-medium mb-1" style={{color: 'var(--text-primary)'}}>Progreso por ejercicio</p>
              <p className="text-xs mb-3" style={{color: 'var(--text-secondary)'}}>Máximo de reps por sesión</p>

              <select
                value={selectedExercise}
                onChange={e => setSelectedExercise(e.target.value)}
                className="input mb-4"
              >
                {exercises.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>

              {repProgressByExercise().length === 0 ? (
                <p className="text-sm text-center py-4" style={{color: 'var(--text-muted)'}}>
                  No hay datos de {selectedExerciseName} todavía
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={repProgressByExercise()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false}/>
                    <XAxis dataKey="name" tick={{fill: '#555555', fontSize: 11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill: '#555555', fontSize: 11}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip />} cursor={{stroke: '#2a2a2a'}}/>
                    <Line
                      type="monotone"
                      dataKey="reps"
                      name="Reps"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{fill: '#22c55e', r: 4}}
                      activeDot={{r: 6}}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Resumen general */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card text-center">
                <p className="text-2xl font-bold" style={{color: 'var(--accent)'}}>{sessions.length}</p>
                <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>Sesiones</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                  {sessions.reduce((acc, s) => acc + (s.sets?.length ?? 0), 0)}
                </p>
                <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>Series totales</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                  {sessions.reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0)}
                </p>
                <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>Minutos totales</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}