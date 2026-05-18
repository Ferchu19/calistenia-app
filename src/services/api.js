import axios from 'axios'

const api = axios.create({
  baseURL: 'https://calistenia-app.duckdns.org',
})

// Agregar token automáticamente a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const register = (email, password, role) =>
  api.post('/auth/register', { email, password, role })

export const getMe = () => api.get('/auth/me')

// Perfiles
export const getMyProfile = () => api.get('/profiles/me')
export const createProfile = (data) => api.post('/profiles/', data)
export const updateProfile = (data) => api.put('/profiles/me', data)

// Ejercicios
export const getExercises = () => api.get('/exercises/')

// Planes
export const getPlans = () => api.get('/plans/')
export const getPlan = (id) => api.get(`/plans/${id}`)

// Entrenamientos
export const getMySessions = () => api.get('/workouts/')
export const createSession = (data) => api.post('/workouts/', data)
export const getStats = () => api.get('/workouts/stats')
export const getRecords = () => api.get('/workouts/records')

export default api