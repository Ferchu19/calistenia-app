import { useState, useEffect } from 'react'
import { getMyProfile, createProfile, updateProfile } from '../services/api'
import { useAuth } from '../context/AuthContext'

const levelLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    weight_kg: '',
    height_cm: '',
    experience_level: 'beginner'
  })

  useEffect(() => {
    getMyProfile()
      .then(res => {
        setProfile(res.data)
        setForm({
          full_name: res.data.full_name,
          username: res.data.username,
          bio: res.data.bio || '',
          weight_kg: res.data.weight_kg || '',
          height_cm: res.data.height_cm || '',
          experience_level: res.data.experience_level
        })
      })
      .catch(() => setEditing(true))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      }
      if (profile) {
        const res = await updateProfile(payload)
        setProfile(res.data)
      } else {
        const res = await createProfile(payload)
        setProfile(res.data)
      }
      setEditing(false)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al guardar el perfil')
    } finally {
      setSaving(false)
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
          <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>Mi perfil</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {!editing && profile ? (
          <>
            {/* Avatar y nombre */}
            <div className="card flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                style={{backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent)'}}>
                {profile.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>{profile.full_name}</h2>
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>@{profile.username}</p>
                <span className="badge-green mt-1 inline-block">
                  {levelLabels[profile.experience_level]}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="card">
                <p className="text-xs mb-1" style={{color: 'var(--text-secondary)'}}>Bio</p>
                <p className="text-sm" style={{color: 'var(--text-primary)'}}>{profile.bio}</p>
              </div>
            )}

            {/* Métricas físicas */}
            <div className="grid grid-cols-2 gap-3">
              {profile.weight_kg && (
                <div className="card">
                  <p className="text-xs mb-1" style={{color: 'var(--text-secondary)'}}>Peso</p>
                  <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                    {profile.weight_kg} <span className="text-sm font-normal" style={{color: 'var(--text-secondary)'}}>kg</span>
                  </p>
                </div>
              )}
              {profile.height_cm && (
                <div className="card">
                  <p className="text-xs mb-1" style={{color: 'var(--text-secondary)'}}>Altura</p>
                  <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                    {profile.height_cm} <span className="text-sm font-normal" style={{color: 'var(--text-secondary)'}}>cm</span>
                  </p>
                </div>
              )}
            </div>

            {/* Info cuenta */}
            <div className="card space-y-2">
              <p className="text-xs" style={{color: 'var(--text-secondary)'}}>
                Email: <span style={{color: 'var(--text-primary)'}}>{user?.email}</span>
              </p>
              <p className="text-xs" style={{color: 'var(--text-secondary)'}}>
                Rol: <span style={{color: 'var(--text-primary)'}}>{user?.role === 'coach' ? 'Coach' : 'Atleta'}</span>
              </p>
            </div>

            <button onClick={() => setEditing(true)} className="btn-secondary">
              Editar perfil
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <p className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>
              {profile ? 'Editar perfil' : 'Completá tu perfil'}
            </p>

            <div>
              <label className="label">Nombre completo</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm({...form, full_name: e.target.value})}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({...form, bio: e.target.value})}
                className="input"
                rows={2}
                placeholder="Contá algo sobre vos..."
                style={{resize: 'none'}}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weight_kg}
                  onChange={e => setForm({...form, weight_kg: e.target.value})}
                  className="input"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="label">Altura (cm)</label>
                <input
                  type="number"
                  value={form.height_cm}
                  onChange={e => setForm({...form, height_cm: e.target.value})}
                  className="input"
                  placeholder="175"
                />
              </div>
            </div>

            <div>
              <label className="label">Nivel</label>
              <select
                value={form.experience_level}
                onChange={e => setForm({...form, experience_level: e.target.value})}
                className="input"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              {profile && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}