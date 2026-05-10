import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout }  = useAuth()
  const navigate          = useNavigate()
  const location          = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const isActive = (path) => location.pathname === path

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`relative text-sm font-medium transition-all duration-200 px-1 py-0.5
        ${isActive(to)
          ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full'
          : 'text-indigo-200 hover:text-white'
        }`}
    >
      {children}
    </Link>
  )

  return (
    <nav className="gradient-bg shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center
                            group-hover:bg-white/30 transition-all duration-200 shadow-inner">
              <span className="text-white font-black text-sm">PDT</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-base leading-tight">Procedure Tool</p>
              <p className="text-indigo-200 text-xs leading-tight">Documentation System</p>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/dashboard">🏠 Dashboard</NavLink>
              <NavLink to="/procedures">📋 Procedures</NavLink>
              <Link
                to="/procedures/new"
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold
                           px-4 py-1.5 rounded-xl transition-all duration-200 border border-white/30
                           hover:border-white/50 shadow-sm"
              >
                ➕ New
              </Link>
            </div>
          )}

          {/* ── User Info + Logout ── */}
          {user && (
            <div className="hidden md:flex items-center gap-3">
              {/* Role Badge */}
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border
                ${user.role === 'ADMIN'
                  ? 'bg-yellow-400/20 text-yellow-200 border-yellow-400/40'
                  : 'bg-white/10 text-indigo-200 border-white/20'
                }`}>
                {user.role === 'ADMIN' ? '👑' : '👤'} {user.role}
              </span>

              {/* Username */}
              <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5">
                <p className="text-white text-xs font-semibold leading-tight">{user.username}</p>
                <p className="text-indigo-300 text-xs leading-tight">{user.email || 'User'}</p>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-red-500/80 text-white text-sm font-medium
                           px-3 py-1.5 rounded-xl border border-white/20 hover:border-red-400/50
                           transition-all duration-200"
              >
                🚪 Logout
              </button>
            </div>
          )}

          {/* ── Mobile Menu Button ── */}
          {user && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>

        {/* ── Mobile Menu ── */}
        {user && menuOpen && (
          <div className="md:hidden pb-4 animate-slide-down border-t border-white/10 mt-2 pt-4 space-y-2">
            {[
              { to: '/dashboard',      label: '🏠 Dashboard' },
              { to: '/procedures',     label: '📋 Procedures' },
              { to: '/procedures/new', label: '➕ New Procedure' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive(to) ? 'bg-white/20 text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center justify-between px-4 py-2 mt-2 border-t border-white/10 pt-3">
              <span className="text-indigo-200 text-sm">👤 {user.username}</span>
              <button onClick={handleLogout}
                className="bg-red-500/80 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
