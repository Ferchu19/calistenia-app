import { useState, useEffect } from 'react'
import { getAthletes, getPlans, assignPlan } from '../services/api'

export default function CoachPanel() {
  const [athletes, setAthletes] = useState([])
  const [plans, setPlans] = useState([])
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getAthletes(), getPlans()])
      .then(([athletesRes, plansRes]) => {
        setAthletes(athletesRes.data)
        setPlans(plansRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAssign = async () => {
    if (!selectedAthlete || !selectedPlan) return
    setAssigning(true)
    setError('')
    setSuccess('')
    try {
      await assignPlan(selectedPlan, selectedAthlete.id)
      setSuccess(`Plan asignado correctamente a ${selectedAthlete.email}`)
      setSelectedAthlete(null)
      setSelectedPlan('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al asignar el plan')
    } finally {
      setAssigning(false)
    }
  }

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
          <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>Panel del coach</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Asignar plan */}
        <div className="card space-y-4">
          <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Asignar plan a atleta</p>

          {/* Lista de atletas */}
          <div>
            <label className="label">Seleccioná un atleta</label>
            <div className="space-y-2">
              {athletes.length === 0 ? (
                <p className="text-sm" style={{color: 'var(--text-muted)'}}>No hay atletas registrados todavía</p>
              ) : (
                athletes.map(athlete => (
                  <div
                    key={athlete.id}
                    onClick={() => setSelectedAthlete(athlete)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition"
                    style={{
                      backgroundColor: selectedAthlete?.id === athlete.id ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                      border: `1px solid ${selectedAthlete?.id === athlete.id ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{backgroundColor: 'var(--bg-card)', color: 'var(--accent)'}}>
                      {athlete.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>{athlete.email}</p>
                      <p className="text-xs" style={{color: 'var(--text-secondary)'}}>Atleta</p>
                    </div>
                    {selectedAthlete?.id === athlete.id && (
                      <span className="ml-auto badge-green">Seleccionado</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Seleccionar plan */}
          {selectedAthlete && (
            <div>
              <label className="label">Seleccioná un plan</label>
              {plans.length === 0 ? (
                <p className="text-sm" style={{color: 'var(--text-muted)'}}>No hay planes creados todavía</p>
              ) : (
                <select
                  value={selectedPlan}
                  onChange={e => setSelectedPlan(e.target.value)}
                  className="input"
                >
                  <option value="">Elegí un plan...</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {plan.difficulty}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {success && (
            <p className="text-sm" style={{color: 'var(--accent)'}}>{success}</p>
          )}
          {error && (
            <p className="text-sm" style={{color: 'var(--danger)'}}>{error}</p>
          )}

          {selectedAthlete && selectedPlan && (
            <button
              onClick={handleAssign}
              disabled={assigning}
              className="btn-primary"
            >
              {assigning ? 'Asignando...' : `Asignar plan a ${selectedAthlete.email}`}
            </button>
          )}
        </div>

        {/* Lista de atletas resumen */}
        <div className="card">
          <p className="text-sm font-medium mb-4" style={{color: 'var(--text-primary)'}}>
            Atletas registrados ({athletes.length})
          </p>
          {athletes.length === 0 ? (
            <p className="text-sm" style={{color: 'var(--text-muted)'}}>No hay atletas todavía</p>
          ) : (
            <div className="space-y-2">
              {athletes.map(athlete => (
                <div key={athlete.id} className="flex items-center justify-between py-2"
                  style={{borderBottom: '1px solid var(--border)'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{backgroundColor: 'var(--bg-secondary)', color: 'var(--accent)'}}>
                      {athlete.email?.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm" style={{color: 'var(--text-primary)'}}>{athlete.email}</p>
                  </div>
                  <span className="badge-gray">Atleta</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}