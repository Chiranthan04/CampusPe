import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { procedureAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'

const COLORS = { ACTIVE: '#4F46E5', DRAFT: '#F59E0B', ARCHIVED: '#6B7280' }

function StatCard({ label, value, color, icon, to, desc }) {
  const content = (
    <div className="card p-6 cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                         shadow-sm group-hover:scale-110 transition-transform duration-200`}
             style={{ background: `${color}15` }}>
          {icon}
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `${color}15`, color }}>
          {label}
        </span>
      </div>
      <p className="text-4xl font-black text-gray-800 mb-1">{value ?? '—'}</p>
      <p className="text-xs text-gray-400">{desc}</p>
      <div className="mt-4 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
             style={{ width: `${Math.min((value || 0) * 10, 100)}%`, background: color }} />
      </div>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl p-3 shadow-lg border border-white/60">
        <p className="text-xs font-bold text-gray-700">{label}</p>
        <p className="text-lg font-black" style={{ color: COLORS[label?.toUpperCase()] || '#4F46E5' }}>
          {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { user }              = useAuth()
  const [stats, setStats]     = useState(null)
  const [recent, setRecent]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, listRes] = await Promise.all([
          procedureAPI.getStats(),
          procedureAPI.getAll(0, 5),
        ])
        setStats(statsRes.data)
        setRecent(listRes.data.content || [])
      } catch {
        setError('Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const chartData = stats ? [
    { name: 'Active',   value: stats.active   || 0 },
    { name: 'Draft',    value: stats.draft    || 0 },
    { name: 'Archived', value: stats.archived || 0 },
  ] : []

  const pieData = chartData.filter(d => d.value > 0)

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="page-container">

        {/* ── Header ── */}
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 gradient-bg rounded-2xl flex items-center justify-center shadow-glow">
                  <span className="text-white text-lg">🏠</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-800">
                    Welcome back, <span className="gradient-text">{user?.username}</span>! 👋
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {user?.role === 'ADMIN'
                      ? '👑 Admin View — Showing all procedures across all users'
                      : '👤 Your personal procedure dashboard'}
                  </p>
                </div>
              </div>
            </div>
            <Link to="/procedures/new" className="btn-primary shadow-glow">
              ➕ New Procedure
            </Link>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading dashboard..." />
        ) : error ? (
          <div className="card p-8 text-center border-red-100">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-red-600 font-semibold">{error}</p>
            <p className="text-gray-400 text-sm mt-2">Make sure Docker is running.</p>
          </div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total"    value={stats?.total}
                color="#4F46E5" icon="📋"
                desc="All procedures"
                to="/procedures" />
              <StatCard label="Active"   value={stats?.active}
                color="#10B981" icon="✅"
                desc="Live procedures"
                to="/procedures?status=ACTIVE" />
              <StatCard label="Draft"    value={stats?.draft}
                color="#F59E0B" icon="✏️"
                desc="In progress"
                to="/procedures?status=DRAFT" />
              <StatCard label="Archived" value={stats?.archived}
                color="#6B7280" icon="📦"
                desc="Archived procedures"
                to="/procedures?status=ARCHIVED" />
            </div>

            {/* ── Charts + Quick Actions ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Bar Chart */}
              <div className="card p-6 lg:col-span-1">
                <h2 className="section-title mb-6">
                  <span className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white text-sm">📊</span>
                  Status Overview
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barSize={40}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.05)' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name.toUpperCase()] || '#4F46E5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="card p-6 lg:col-span-1">
                <h2 className="section-title mb-6">
                  <span className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white text-sm">🥧</span>
                  Distribution
                </h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData} cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        paddingAngle={4} dataKey="value"
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={COLORS[entry.name.toUpperCase()] || '#4F46E5'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(value) => (
                          <span className="text-xs text-gray-600 font-medium">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                    No data yet
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="card p-6 lg:col-span-1">
                <h2 className="section-title mb-6">
                  <span className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white text-sm">⚡</span>
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  {[
                    { to: '/procedures/new',             label: '➕ Create New Procedure', style: 'btn-primary' },
                    { to: '/procedures',                 label: '📋 View All Procedures',  style: 'btn-secondary' },
                    { to: '/procedures?status=DRAFT',    label: '✏️  Review Drafts',        style: 'btn-secondary' },
                    { to: '/procedures?status=ARCHIVED', label: '📦 View Archived',         style: 'btn-secondary' },
                  ].map(({ to, label, style }) => (
                    <Link key={to} to={to} className={`${style} w-full py-2.5 text-sm`}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Recent Procedures ── */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="section-title">
                  <span className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white text-sm">🕐</span>
                  Recent Procedures
                </h2>
                <Link to="/procedures"
                  className="text-primary text-sm font-semibold hover:text-primary-dark transition-colors flex items-center gap-1">
                  View all →
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-500 font-medium">No procedures yet</p>
                  <p className="text-gray-400 text-sm mt-1 mb-4">Get started by creating your first procedure</p>
                  <Link to="/procedures/new" className="btn-primary inline-flex">
                    ➕ Create First Procedure
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recent.map((proc, i) => (
                    <div key={proc.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-indigo-50/30
                                 transition-colors duration-150 group animate-fade-in"
                      style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center
                                        flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <span className="text-primary text-sm font-bold">#{proc.id}</span>
                        </div>
                        <div className="min-w-0">
                          <Link to={`/procedures/${proc.id}`}
                            className="text-sm font-semibold text-gray-800 hover:text-primary
                                       transition-colors truncate block">
                            {proc.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-0.5">
                            {proc.category && (
                              <span className="text-xs text-gray-400">📁 {proc.category}</span>
                            )}
                            {proc.createdBy && (
                              <span className="text-xs text-gray-400">👤 {proc.createdBy}</span>
                            )}
                            {proc.createdAt && (
                              <span className="text-xs text-gray-400">
                                📅 {new Date(proc.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <StatusBadge status={proc.status} />
                        <Link to={`/procedures/${proc.id}`}
                          className="text-xs bg-primary/10 hover:bg-primary/20 text-primary
                                     px-3 py-1.5 rounded-lg font-medium transition-colors">
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
