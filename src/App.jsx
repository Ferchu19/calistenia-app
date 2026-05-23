import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewWorkout from './pages/NewWorkout'
import Exercises from './pages/Exercises'
import Profile from './pages/Profile'
import NewExercise from './pages/NewExercise'
import Progress from './pages/Progress'
import CoachPanel from './pages/CoachPanel'
import Circuit from './pages/Circuit'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/workout/new" element={<PrivateRoute><NewWorkout /></PrivateRoute>} />
           <Route path="/exercises" element={<PrivateRoute><Exercises /></PrivateRoute>} />
           <Route path="/exercises/new" element={<PrivateRoute><NewExercise /></PrivateRoute>} />
           <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
           <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
           <Route path="/coach" element={<PrivateRoute><CoachPanel /></PrivateRoute>} />
           <Route path="/circuit" element={<PrivateRoute><Circuit /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
