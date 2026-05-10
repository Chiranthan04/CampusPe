import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProcedureListPage from './pages/ProcedureListPage'
import ProcedureFormPage from './pages/ProcedureFormPage'
import ProcedureDetailPage from './pages/ProcedureDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"              element={<DashboardPage />} />
            <Route path="/procedures"             element={<ProcedureListPage />} />
            <Route path="/procedures/new"         element={<ProcedureFormPage />} />
            <Route path="/procedures/:id"         element={<ProcedureDetailPage />} />
            <Route path="/procedures/:id/edit"    element={<ProcedureFormPage />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
