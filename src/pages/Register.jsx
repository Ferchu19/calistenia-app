import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/api'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', role: 'athlete' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form.email, form.password, form.role)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: 'var(--bg-primary)'}}>
        <div className="card w-full max-w-md text-center p-10">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"
            style={{backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent)'}}>
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>¡Cuenta creada!</h2>
          <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Te estamos redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: 'var(--bg-primary)'}}>
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent)'}}>
            <span style={{fontSize: '24px'}}>💪</span>
          </div>
          <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>Crear cuenta</h1>
          <p className="mt-1 text-sm" style={{color: 'var(--text-secondary)'}}>Empezá tu camino en calistenia</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="input"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="label">Rol</label>
              <select
                value={form.role}
                onChange={e => setForm({...form, role: e.target.value})}
                className="input"
              >
                <option value="athlete">Atleta</option>
                <option value="coach">Coach</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-center" style={{color: 'var(--danger)'}}>{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{color: 'var(--text-secondary)'}}>
          ¿Ya tenés cuenta?{' '}
          <a href="/login" style={{color: 'var(--accent)', fontWeight: '500'}}>Iniciá sesión</a>
        </p>
      </div>
    </div>
  )
}