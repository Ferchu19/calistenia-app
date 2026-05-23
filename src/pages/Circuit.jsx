import { useState, useEffect, useRef } from 'react'
import { getExercises, createSession } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Circuit() {
  const [exercises, setExercises] = useState([])
  const [circuitExercises, setCircuitExercises] = useState([])
  const [circuitName, setCircuitName] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  const [phase, setPhase] = useState('setup')
  const [time, setTime] = useState(0)
  const [limitReached, setLimitReached] = useState(false)
  const intervalRef = useRef(null)
  const audioCtxRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    getExercises().then(res => setExercises(res.data))
  }, [])

  // Alerta de sonido cuando llega al límite
  useEffect(() => {
    if (timeLimit && time === parseInt(timeLimit) * 60 && phase === 'running') {
      setLimitReached(true)
      playAlert()
    }
  }, [time])

  const playAlert = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const playBeep = (startTime, frequency = 880, duration = 0.8) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.5, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }

    // 5 beeps más largos
    playBeep(ctx.currentTime, 880, 0.8)
    playBeep(ctx.currentTime + 1, 880, 0.8)
    playBeep(ctx.currentTime + 2, 1100, 0.8)
    playBeep(ctx.currentTime + 3, 1100, 0.8)
    playBeep(ctx.currentTime + 4, 1320, 1.2)

    // Vibración en celular
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 800])
    }
  } catch (err) {
    console.error('Error reproduciendo sonido:', err)
  }
  }

  const addExercise = () => {
    setCircuitExercises([...circuitExercises, { exercise_id: '', reps: '' }])
  }

  const updateExercise = (index, field, value) => {
    const updated = [...circuitExercises]
    updated[index][field] = value
    setCircuitExercises(updated)
  }

  const removeExercise = (index) => {
    setCircuitExercises(circuitExercises.filter((_, i) => i !== index))
  }

  const startCircuit = () => {
    if (circuitExercises.length === 0) return alert('Agregá al menos un ejercicio')
    setPhase('ready')
    setTime(0)
    setLimitReached(false)
  }

  const startTimer = () => {
    setPhase('running')
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = async () => {
    clearInterval(intervalRef.current)
    setPhase('finished')
    try {
      const sets = circuitExercises.map((ex, i) => ({
        exercise_id: parseInt(ex.exercise_id),
        set_number: i + 1,
        reps: ex.reps ? parseInt(ex.reps) : null,
        duration_seconds: time,
        notes: `Circuito: ${circuitName || 'Sin nombre'}`
      }))
      await createSession({
        duration_minutes: Math.ceil(time / 60),
        notes: `Circuito completado en ${formatTime(time)} — ${circuitName || 'Sin nombre'}`,
        rating: 5,
        sets
      })
    } catch (err) {
      console.error('Error guardando circuito:', err)
    }
  }

  const resetCircuit = () => {
    clearInterval(intervalRef.current)
    setPhase('setup')
    setTime(0)
    setLimitReached(false)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const timeLimitSeconds = timeLimit ? parseInt(timeLimit) * 60 : null
  const progress = timeLimitSeconds ? Math.min((time / timeLimitSeconds) * 100, 100) : null

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-primary)'}}>

      <div style={{backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/dashboard" style={{color: 'var(--text-secondary)', fontSize: '20px'}}>←</a>
          <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>Circuito</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Setup */}
        {phase === 'setup' && (
          <>
            <div className="card space-y-4">
              <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Configurá tu circuito</p>

              <div>
                <label className="label">Nombre del circuito</label>
                <input
                  type="text"
                  value={circuitName}
                  onChange={e => setCircuitName(e.target.value)}
                  className="input"
                  placeholder="Ej: Circuito de fuerza A"
                />
              </div>

              <div>
                <label className="label">Tiempo límite (minutos) — opcional</label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={e => setTimeLimit(e.target.value)}
                  className="input"
                  placeholder="Ej: 10"
                />
                {timeLimit && (
                  <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>
                    Vas a recibir una alerta sonora al llegar a {timeLimit} minutos
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Ejercicios ({circuitExercises.length})</p>
                <button onClick={addExercise} style={{color: 'var(--accent)', fontSize: '13px', fontWeight: '500'}}>
                  + Agregar
                </button>
              </div>

              {circuitExercises.length === 0 && (
                <p className="text-sm text-center py-4" style={{color: 'var(--text-muted)'}}>
                  Agregá ejercicios para armar tu circuito
                </p>
              )}

              {circuitExercises.map((ex, index) => (
                <div key={index} className="p-3 rounded-xl space-y-2"
                  style={{backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)'}}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{color: 'var(--accent)'}}>Ejercicio {index + 1}</span>
                    <button onClick={() => removeExercise(index)} className="text-xs" style={{color: 'var(--danger)'}}>
                      Eliminar
                    </button>
                  </div>
                  <select
                    value={ex.exercise_id}
                    onChange={e => updateExercise(index, 'exercise_id', e.target.value)}
                    className="input"
                  >
                    <option value="">Seleccioná un ejercicio</option>
                    {exercises.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={ex.reps}
                    onChange={e => updateExercise(index, 'reps', e.target.value)}
                    className="input"
                    placeholder="Reps"
                  />
                </div>
              ))}
            </div>

            <button onClick={startCircuit} className="btn-primary">
              Preparar circuito
            </button>
          </>
        )}

        {/* Ready */}
        {phase === 'ready' && (
          <div className="card text-center py-12 space-y-6">
            <div>
              <p className="text-sm mb-2" style={{color: 'var(--text-secondary)'}}>
                {circuitName || 'Circuito'} · {circuitExercises.length} ejercicios
                {timeLimit && ` · Límite: ${timeLimit} min`}
              </p>
              <p className="text-6xl font-bold" style={{color: 'var(--accent)'}}>00:00</p>
            </div>
            <div className="space-y-2">
              {circuitExercises.map((ex, i) => {
                const exercise = exercises.find(e => e.id === parseInt(ex.exercise_id))
                return (
                  <p key={i} className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    {i + 1}. {exercise?.name} — {ex.reps} reps
                  </p>
                )
              })}
            </div>
            <button onClick={startTimer} className="btn-primary">Iniciar cronómetro</button>
          </div>
        )}

        {/* Running */}
        {phase === 'running' && (
          <div className="card text-center py-12 space-y-6">
            {limitReached && (
              <div className="p-3 rounded-xl" style={{backgroundColor: '#2d0000', border: '1px solid var(--danger)'}}>
                <p className="text-sm font-medium" style={{color: 'var(--danger)'}}>
                  ⚠️ Tiempo límite alcanzado
                </p>
              </div>
            )}
            <div>
              <p className="text-xs mb-2" style={{color: 'var(--text-secondary)'}}>EN PROGRESO</p>
              <p className="font-bold" style={{
                color: limitReached ? 'var(--danger)' : 'var(--accent)',
                fontSize: '72px',
                lineHeight: 1
              }}>
                {formatTime(time)}
              </p>
              {timeLimitSeconds && (
                <div className="mt-4">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{backgroundColor: 'var(--border)'}}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: limitReached ? 'var(--danger)' : 'var(--accent)'
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>
                    {timeLimit} min límite
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {circuitExercises.map((ex, i) => {
                const exercise = exercises.find(e => e.id === parseInt(ex.exercise_id))
                return (
                  <p key={i} className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    {i + 1}. {exercise?.name} — {ex.reps} reps
                  </p>
                )
              })}
            </div>
            <button onClick={stopTimer} className="btn-primary" style={{backgroundColor: 'var(--danger)'}}>
              Finalizar circuito
            </button>
          </div>
        )}

        {/* Finished */}
        {phase === 'finished' && (
          <div className="card text-center py-12 space-y-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent)'}}>
              <span className="text-4xl">✓</span>
            </div>
            <div>
              <p className="text-sm mb-2" style={{color: 'var(--text-secondary)'}}>Circuito completado</p>
              <p className="text-5xl font-bold" style={{color: limitReached ? 'var(--danger)' : 'var(--accent)'}}>
                {formatTime(time)}
              </p>
              {timeLimitSeconds && (
                <p className="text-xs mt-2" style={{color: time > timeLimitSeconds ? 'var(--danger)' : 'var(--accent)'}}>
                  {time > timeLimitSeconds
                    ? `${formatTime(time - timeLimitSeconds)} sobre el límite`
                    : `${formatTime(timeLimitSeconds - time)} bajo el límite`}
                </p>
              )}
              <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>Tiempo registrado y guardado</p>
            </div>
            <div className="flex gap-3">
              <button onClick={resetCircuit} className="btn-secondary">Nuevo circuito</button>
              <button onClick={() => navigate('/dashboard')} className="btn-primary">Ver dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}