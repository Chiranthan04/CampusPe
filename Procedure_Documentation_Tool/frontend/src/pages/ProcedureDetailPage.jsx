import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { procedureAPI } from '../services/api'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

// ── AI Recommendations Renderer ───────────────────────────────
function RecommendationsRenderer({ content }) {
  try {
    // Clean up markdown code blocks if present
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleaned)

    if (Array.isArray(data)) {
      return (
        <div className="space-y-3 mt-3">
          {data.map((item, index) => (
            <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                  item.priority === 'HIGH'   ? 'bg-red-100 text-red-700' :
                  item.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                               'bg-green-100 text-green-700'
                }`}>
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.action_type === 'IMPROVE' ? 'bg-blue-100 text-blue-700' :
                    item.action_type === 'ADD'     ? 'bg-green-100 text-green-700' :
                    item.action_type === 'REMOVE'  ? 'bg-red-100 text-red-700' :
                                                     'bg-purple-100 text-purple-700'
                  }`}>
                    {item.action_type || 'SUGGEST'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    item.priority === 'HIGH'   ? 'border-red-200 text-red-600' :
                    item.priority === 'MEDIUM' ? 'border-yellow-200 text-yellow-600' :
                                                 'border-green-200 text-green-600'
                  }`}>
                    {item.priority || 'NORMAL'} Priority
                  </span>
                </div>
                <p className="text-sm text-gray-700">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )
    }
  } catch {
    // Not JSON — render as plain text
  }
  return (
    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mt-3">
      {content}
    </p>
  )
}

// ── AI Report Renderer ────────────────────────────────────────
function ReportRenderer({ content }) {
  try {
    // Clean up markdown code blocks if present
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleaned)

    return (
      <div className="space-y-4 mt-3">
        {/* Title */}
        {data.title && (
          <div>
            <h3 className="text-base font-bold text-gray-800">{data.title}</h3>
          </div>
        )}

        {/* Summary */}
        {data.summary && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
              📋 Summary
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Overview */}
        {data.overview && (
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              🔍 Overview
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{data.overview}</p>
          </div>
        )}

        {/* Key Items */}
        {data.key_items && Array.isArray(data.key_items) && (
          <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
            <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">
              ✅ Key Items
            </h4>
            <ul className="space-y-2">
              {data.key_items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations && Array.isArray(data.recommendations) && (
          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
            <h4 className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-3">
              💡 Recommendations
            </h4>
            <ul className="space-y-2">
              {data.recommendations.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500 mt-0.5 flex-shrink-0">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conclusion */}
        {data.conclusion && (
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
              🎯 Conclusion
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{data.conclusion}</p>
          </div>
        )}
      </div>
    )
  } catch {
    // Not JSON — render as plain text with markdown-like formatting
  }

  // Plain text fallback with section detection
  return (
    <div className="mt-3 space-y-3">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-base font-bold text-gray-800 mt-4">{line.replace('## ', '')}</h3>
        }
        if (line.startsWith('### ')) {
          return <h4 key={i} className="text-sm font-semibold text-gray-700 mt-3">{line.replace('### ', '')}</h4>
        }
        if (line.startsWith('- ') || line.match(/^\d+\./)) {
          return <p key={i} className="text-sm text-gray-700 pl-4">{line}</p>
        }
        if (line.trim() === '') return <div key={i} className="h-1" />
        return <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
      })}
    </div>
  )
}

// ── Section Wrapper ───────────────────────────────────────────
function Section({ title, content, icon, fallback = false, children }) {
  const [open, setOpen] = useState(true)
  if (!content && !children) return null

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
          {fallback && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
              AI Unavailable
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          {children || (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mt-3">
              {content}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function ProcedureDetailPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const location    = useLocation()

  const [procedure, setProcedure]     = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [successMsg, setSuccessMsg]   = useState(location.state?.success || null)

  useEffect(() => {
    const fetchProcedure = async () => {
      try {
        const res = await procedureAPI.getById(id)
        setProcedure(res.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Procedure not found.')
        } else {
          setError('Failed to load procedure.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProcedure()
  }, [id])

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000)
      return () => clearTimeout(t)
    }
  }, [successMsg])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await procedureAPI.delete(id)
      navigate('/procedures', {
        state: { success: 'Procedure deleted successfully.' }
      })
    } catch {
      setError('Failed to delete procedure.')
      setDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <LoadingSpinner message="Loading procedure..." />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Link to="/procedures"
            className="inline-block mt-4 text-primary hover:underline text-sm">
            ← Back to Procedures
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/procedures" className="hover:text-primary">Procedures</Link>
          <span>›</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">
            {procedure.title}
          </span>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            ✅ {successMsg}
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-xl font-bold text-gray-800">{procedure.title}</h1>
                <StatusBadge status={procedure.status} />
                {procedure.aiFallback && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
                    ⚠️ AI Fallback
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                {procedure.category && <span>📁 {procedure.category}</span>}
                {procedure.createdBy && <span>👤 {procedure.createdBy}</span>}
                {procedure.createdAt && (
                  <span>📅 {new Date(procedure.createdAt).toLocaleDateString()}</span>
                )}
                {procedure.updatedAt && (
                  <span>🔄 Updated {new Date(procedure.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
              {procedure.tags && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {procedure.tags.split(',').map((tag) => (
                    <span key={tag.trim()}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                      🏷️ {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link
                to={`/procedures/${id}/edit`}
                className="bg-primary text-white text-sm font-medium px-4 py-2 rounded hover:bg-primary-dark transition-colors min-h-[40px] flex items-center"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={() => setDeleteModal(true)}
                className="bg-red-50 text-red-600 border border-red-200 text-sm font-medium px-4 py-2 rounded hover:bg-red-100 transition-colors min-h-[40px]"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            📄 Description
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {procedure.description}
          </p>
        </div>

        {/* AI Generated Description */}
        <Section
          title="AI Generated Description"
          content={procedure.aiDescription}
          icon="🤖"
          fallback={procedure.aiFallback}
        />

        {/* AI Recommendations — parsed from JSON */}
        {procedure.aiRecommendations && (
          <Section
            title="AI Recommendations"
            icon="💡"
            fallback={procedure.aiFallback}
            content={procedure.aiRecommendations}
          >
            <RecommendationsRenderer content={procedure.aiRecommendations} />
          </Section>
        )}

        {/* AI Report — parsed from JSON */}
        {procedure.aiReport && (
          <Section
            title="AI Generated Report"
            icon="📊"
            fallback={procedure.aiFallback}
            content={procedure.aiReport}
          >
            <ReportRenderer content={procedure.aiReport} />
          </Section>
        )}

        {/* No AI Content Notice */}
        {!procedure.aiDescription && !procedure.aiRecommendations && !procedure.aiReport && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-4">
            <p className="text-sm text-yellow-700">
              ⚠️ <strong>AI content not available.</strong> Try editing and saving
              the procedure again to regenerate AI content.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow p-5 mt-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">📋 Procedure Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">ID</p>
              <p className="text-gray-700 font-medium">#{procedure.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
              <StatusBadge status={procedure.status} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Category</p>
              <p className="text-gray-700">{procedure.category || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Created By</p>
              <p className="text-gray-700">{procedure.createdBy || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Created At</p>
              <p className="text-gray-700">
                {procedure.createdAt ? new Date(procedure.createdAt).toLocaleString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Updated At</p>
              <p className="text-gray-700">
                {procedure.updatedAt ? new Date(procedure.updatedAt).toLocaleString() : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link to="/procedures"
            className="text-sm text-primary hover:underline flex items-center gap-1">
            ← Back to Procedures
          </Link>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Procedure</h3>
            <p className="text-gray-500 text-sm mb-2">Are you sure you want to delete:</p>
            <p className="text-gray-800 font-medium text-sm mb-6 bg-gray-50 p-3 rounded">
              "{procedure.title}"
            </p>
            <p className="text-red-500 text-xs mb-6">⚠️ This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2.5 rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Deleting...
                  </span>
                ) : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
