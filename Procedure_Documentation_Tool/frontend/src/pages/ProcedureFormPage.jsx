import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { procedureAPI } from '../services/api'
import Navbar from '../components/Navbar'

const CATEGORIES = [
  'HR', 'Finance', 'IT', 'Operations',
  'Legal', 'Marketing', 'Sales', 'Other'
]
const STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED']

export default function ProcedureFormPage() {
  const { id }        = useParams()
  const isEdit        = Boolean(id)
  const navigate      = useNavigate()

  const [form, setForm]       = useState({
    title: '', description: '', category: '',
    status: 'DRAFT', tags: ''
  })
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    const fetchProcedure = async () => {
      try {
        const res = await procedureAPI.getById(id)
        const p   = res.data
        setForm({
          title:       p.title       || '',
          description: p.description || '',
          category:    p.category    || '',
          status:      p.status      || 'DRAFT',
          tags:        p.tags        || '',
        })
      } catch {
        setApiError('Failed to load procedure.')
      } finally {
        setFetching(false)
      }
    }
    fetchProcedure()
  }, [id, isEdit])

  const validate = () => {
    const e = {}
    if (!form.title.trim())                e.title       = 'Title is required.'
    else if (form.title.trim().length < 3) e.title       = 'Title must be at least 3 characters.'
    if (!form.description.trim())          e.description = 'Description is required.'
    else if (form.description.trim().length < 10)
                                           e.description = 'Description must be at least 10 characters.'
    return e
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: null }))
    setApiError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length > 0) { setErrors(v); return }
    setLoading(true)
    try {
      if (isEdit) {
        await procedureAPI.update(id, form)
        navigate(`/procedures/${id}`, { state: { success: 'Procedure updated successfully!' } })
      } else {
        const res = await procedureAPI.create(form)
        navigate(`/procedures/${res.data.id}`, { state: { success: 'Procedure created successfully!' } })
      }
    } catch (err) {
      setApiError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} procedure.`)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/procedures" className="hover:text-primary">Procedures</Link>
          <span>›</span>
          <span className="text-gray-800 font-medium">
            {isEdit ? 'Edit Procedure' : 'New Procedure'}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-6">
            {isEdit ? '✏️ Edit Procedure' : '➕ Create New Procedure'}
          </h1>

          {apiError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter procedure title"
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={loading}
                rows={6}
                placeholder="Describe the procedure in detail..."
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                  errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {form.description.length} characters
              </p>
            </div>

            {/* Category + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                name="tags"
                type="text"
                value={form.tags}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g. onboarding, hr, training"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-400 mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* AI Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-blue-700">
                🤖 <strong>AI Enhancement:</strong> After saving, our AI will automatically
                generate a description, recommendations, and a full report for this procedure.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-2.5 rounded font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    {isEdit ? 'Updating...' : 'Creating & Generating AI...'}
                  </span>
                ) : (isEdit ? '💾 Update Procedure' : '✨ Create Procedure')}
              </button>
              <Link
                to={isEdit ? `/procedures/${id}` : '/procedures'}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded font-medium text-sm hover:bg-gray-50 transition-colors text-center min-h-[44px] flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
