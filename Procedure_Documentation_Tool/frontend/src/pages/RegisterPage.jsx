import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm]         = useState({ firstName:'', lastName:'', username:'', email:'', password:'', confirm:'' })
  const [showPass, setShowPass] = useState(false)
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const { register } = useAuth()
  const navigate     = useNavigate()

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setErrors(p => ({ ...p, [field]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.username.trim())                  e.username = 'Username is required.'
    if (!form.email.trim())                     e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email.'
    if (!form.password)                         e.password = 'Password is required.'
    else if (form.password.length < 6)          e.password = 'Minimum 6 characters.'
    if (form.password !== form.confirm)         e.confirm  = 'Passwords do not match.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length > 0) { setErrors(v); return }
    setLoading(true); setApiError(null)
    try {
      await register(form.username, form.email, form.password, form.firstName, form.lastName)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(err.response?.status === 409
        ? 'Username or email already exists.'
        : err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-8">
            <span className="text-white font-black text-3xl">PDT</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">Join the Team</h1>
          <p className="text-indigo-200 text-lg max-w-sm mx-auto">
            Create your account and start documenting procedures with AI assistance.
          </p>
          <div className="mt-10 space-y-4 text-left max-w-xs mx-auto">
            {[
              { icon: '✅', text: 'Create & manage procedures'          },
              { icon: '🤖', text: 'AI-generated descriptions & reports' },
              { icon: '💡', text: 'Smart improvement recommendations'   },
              { icon: '🔒', text: 'Secure role-based access'            },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white">
                <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  {icon}
                </span>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8
                      bg-gradient-to-br from-slate-50 to-indigo-50/30 overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up py-4">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-black text-lg">PDT</span>
            </div>
            <h1 className="text-xl font-black gradient-text">Create Account</h1>
          </div>

          <div className="card p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-800">Create Account ✨</h2>
              <p className="text-gray-500 text-sm mt-1">Fill in your details to get started</p>
            </div>

            {apiError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl
                              text-sm text-red-600 flex items-center gap-2 animate-slide-down">
                <span>⚠️</span> {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── Name Row ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text" value={form.firstName} onChange={set('firstName')}
                    disabled={loading} placeholder="John" autoComplete="given-name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text" value={form.lastName} onChange={set('lastName')}
                    disabled={loading} placeholder="Doe" autoComplete="family-name"
                    className="input-field"
                  />
                </div>
              </div>

              {/* ── Username ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  <input
                    type="text" value={form.username} onChange={set('username')}
                    disabled={loading} placeholder="johndoe" autoComplete="username"
                    className={`input-field pl-10 ${errors.username ? 'input-error' : ''}`}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1.5">⚠️ {errors.username}</p>
                )}
              </div>

              {/* ── Email ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                  <input
                    type="email" value={form.email} onChange={set('email')}
                    disabled={loading} placeholder="you@example.com" autoComplete="email"
                    className={`input-field pl-10 ${errors.email ? 'input-error' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1.5">⚠️ {errors.email}</p>
                )}
              </div>

              {/* ── Password ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <button
                    type="button" onClick={() => setShowPass(!showPass)}
                    className="text-xs text-primary hover:text-primary-dark font-medium"
                  >
                    {showPass ? '🙈 Hide' : '👁️ Show'}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={set('password')} disabled={loading}
                    placeholder="Min. 6 characters" autoComplete="new-password"
                    className={`input-field pl-10 ${errors.password ? 'input-error' : ''}`}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1.5">⚠️ {errors.password}</p>
                )}
              </div>

              {/* ── Confirm Password ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔐</span>
                  <input
                    type={showPass ? 'text' : 'password'} value={form.confirm}
                    onChange={set('confirm')} disabled={loading}
                    placeholder="Repeat your password" autoComplete="new-password"
                    className={`input-field pl-10 ${errors.confirm ? 'input-error' : ''}`}
                  />
                </div>
                {errors.confirm && (
                  <p className="text-xs text-red-500 mt-1.5">⚠️ {errors.confirm}</p>
                )}
              </div>

              {/* ── Submit ── */}
              <button
                type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-base mt-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white
                                     border-t-transparent rounded-full" />
                    Creating account...
                  </>
                ) : '🚀 Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login"
                  className="text-primary font-semibold hover:text-primary-dark transition-colors">
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
