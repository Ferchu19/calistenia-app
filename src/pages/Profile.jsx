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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600">←</a>
          <h1 className="text-lg font-bold text-gray-900">Mi perfil</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {!editing && profile ? (
          <>
            {/* Vista del perfil */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                  {profile.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{profile.full_name}</h2>
                  <p className="text-sm text-gray-500">@{profile.username}</p>
                  <span className="text-xs bg-purple-50 text-primary px-2 py-0.5 rounded-full">
                    {levelLabels[profile.experience_level]}
                  </span>
                </div>
              </div>

              {profile.bio && (
                <p className="text-sm text-gray-600 mb-4">{profile.bio}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                {profile.weight_kg && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Peso</p>
                    <p className="text-lg font-bold text-gray-900">{profile.weight_kg} <span className="text-sm font-normal">kg</span></p>
                  </div>
                )}
                {profile.height_cm && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Altura</p>
                    <p className="text-lg font-bold text-gray-900">{profile.height_cm} <span className="text-sm font-normal">cm</span></p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Email: {user?.email}</p>
                <p className="text-xs text-gray-500">Rol: {user?.role}</p>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3 text-sm font-medium hover:bg-gray-50 transition"
            >
              ✏️ Editar perfil
            </button>
          </>
        ) : (
          /* Formulario de edición/creación */
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              {profile ? 'Editar perfil' : 'Completá tu perfil'}
            </h2>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre completo</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm({...form, full_name: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({...form, bio: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                placeholder="Contá algo sobre vos..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weight_kg}
                  onChange={e => setForm({...form, weight_kg: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={form.height_cm}
                  onChange={e => setForm({...form, height_cm: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="175"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Nivel</label>
              <select
                value={form.experience_level}
                onChange={e => setForm({...form, experience_level: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}