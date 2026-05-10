import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!username.trim() && !password.trim()) {
      setError('Please enter your username and password.')
      return
    }
    if (!username.trim()) {
      setError('Please enter your username.')
      return
    }
    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await login(username.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        setError('❌ Wrong username or password. Please try again.')
      } else if (status === 403) {
        setError('🚫 Your account has been disabled. Contact admin.')
      } else if (status === 404) {
        setError('❌ User not found. Please check your username.')
      } else if (status === 429) {
        setError('⏳ Too many attempts. Please wait and try again.')
      } else if (status === 500) {
        setError('🔧 Server error. Please try again in a moment.')
      } else if (!err.response) {
        setError('🌐 Cannot connect to server. Check your connection.')
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
    if (error) setError(null)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    if (error) setError(null)
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg flex-col items-center
                      justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-3xl flex items-center
                          justify-center mx-auto mb-8 shadow-glow">
            <span className="text-white font-black text-3xl">PDT</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Procedure<br />Documentation<br />Tool
          </h1>
          <p className="text-indigo-200 text-lg max-w-sm mx-auto leading-relaxed">
            Manage your company procedures smarter with AI-powered insights
            and recommendations.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-10">
            {['🤖 AI Powered', '🔒 Secure RBAC', '📊 Analytics', '⚡ Fast Search'].map(f => (
              <span key={f}
                className="bg-white/15 backdrop-blur text-white text-sm px-4 py-2
                           rounded-full border border-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8
                      bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="w-full max-w-md animate-slide-up">

          {/* ── Mobile Logo ── */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center
                            justify-center mx-auto mb-4 shadow-glow">
              <span className="text-white font-black text-xl">PDT</span>
            </div>
            <h1 className="text-2xl font-black gradient-text">Procedure Tool</h1>
          </div>

          <div className="card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-800">Welcome back! 👋</h2>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to your account to continue
              </p>
            </div>

            {/* ── Error Box ── */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-300 rounded-xl
                              text-sm text-red-700 flex items-start gap-3
                              animate-slide-down shadow-sm">
                <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
                <div>
                  <p className="font-semibold">Login Failed</p>
                  <p className="mt-0.5 text-red-600">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* ── Username ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    👤
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    disabled={loading}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className={`input-field pl-10 ${
                      error && !username.trim() ? 'input-error' : ''
                    }`}
                  />
                </div>
              </div>

              {/* ── Password ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    🔒
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={loading}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`input-field pl-10 pr-12 ${
                      error && !password.trim() ? 'input-error' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600 text-sm transition-colors"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white
                                     border-t-transparent rounded-full" />
                    Signing in...
                  </>
                ) : '🚀 Sign In'}
              </button>
            </form>

            {/* ── Register Link ── */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register"
                  className="text-primary font-semibold hover:text-primary-dark transition-colors">
                  Create one →
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
