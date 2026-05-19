import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getMe } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(email, password)
      const token = res.data.access_token
      localStorage.setItem('token', token)
      const meRes = await getMe()
      loginUser(token, meRes.data)
      navigate('/dashboard')
    } catch (err) {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: 'var(--bg-primary)'}}>
      <div className="w-full max-w-md">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent)'}}>
            <span style={{fontSize: '24px'}}>💪</span>
          </div>
          <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>Calistenia App</h1>
          <p className="mt-1 text-sm" style={{color: 'var(--text-secondary)'}}>Iniciá sesión para continuar</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-center" style={{color: 'var(--danger)'}}>{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{color: 'var(--text-secondary)'}}>
          ¿No tenés cuenta?{' '}
          <a href="/register" style={{color: 'var(--accent)', fontWeight: '500'}}>Registrate</a>
        </p>
      </div>
    </div>
  )
}