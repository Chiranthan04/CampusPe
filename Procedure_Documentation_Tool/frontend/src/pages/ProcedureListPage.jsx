import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { procedureAPI } from '../services/api'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

const STATUSES = ['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED']

export default function ProcedureListPage() {
  const [searchParams, setSearchParams]     = useSearchParams()
  const [procedures, setProcedures]         = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [totalPages, setTotalPages]         = useState(0)
  const [totalElements, setTotalElements]   = useState(0)
  const [search, setSearch]                 = useState('')
  const [searchInput, setSearchInput]       = useState('')
  const [deleteId, setDeleteId]             = useState(null)
  const [deleting, setDeleting]             = useState(false)
  const [successMsg, setSuccessMsg]         = useState(null)

  const page   = parseInt(searchParams.get('page')   || '0')
  const status = searchParams.get('status') || 'ALL'

  const fetchProcedures = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (search.trim()) {
        res = await procedureAPI.search(search, page, 10)
      } else if (status && status !== 'ALL') {
        res = await procedureAPI.filterByStatus(status, page, 10)
      } else {
        res = await procedureAPI.getAll(page, 10)
      }
      setProcedures(res.data.content || [])
      setTotalPages(res.data.totalPages || 0)
      setTotalElements(res.data.totalElements || 0)
    } catch {
      setError('Failed to load procedures.')
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => { fetchProcedures() }, [fetchProcedures])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setSearchParams({ page: '0' })
  }

  const handleClearSearch = () => {
    setSearch('')
    setSearchInput('')
    setSearchParams({ page: '0' })
  }

  const handleStatusFilter = (s) => {
    setSearch('')
    setSearchInput('')
    if (s === 'ALL') {
      setSearchParams({ page: '0' })
    } else {
      setSearchParams({ status: s, page: '0' })
    }
  }

  const handlePageChange = (newPage) => {
    const params = { page: String(newPage) }
    if (status && status !== 'ALL') params.status = status
    setSearchParams(params)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await procedureAPI.delete(deleteId)
      setSuccessMsg('Procedure deleted successfully.')
      setDeleteId(null)
      fetchProcedures()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch {
      setError('Failed to delete procedure.')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Procedures</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {totalElements} procedure{totalElements !== 1 ? 's' : ''} found
            </p>
          </div>
          <Link
            to="/procedures/new"
            className="bg-primary text-white text-sm font-medium px-4 py-2.5 rounded hover:bg-primary-dark transition-colors min-h-[44px] flex items-center justify-center w-full sm:w-auto"
          >
            ➕ New Procedure
          </Link>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            ✅ {successMsg}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search procedures by title, description or category..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors min-h-[44px]"
            >
              Clear
            </button>
          )}
        </form>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
                status === s || (s === 'ALL' && !searchParams.get('status'))
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner message="Loading procedures..." />
        ) : procedures.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">No procedures found</p>
            <p className="text-gray-400 text-sm mb-4">
              {search ? `No results for "${search}"` : 'Get started by creating your first procedure'}
            </p>
            <Link
              to="/procedures/new"
              className="inline-block bg-primary text-white text-sm font-medium px-6 py-2.5 rounded hover:bg-primary-dark transition-colors"
            >
              Create Procedure
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Created By</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {procedures.map((proc) => (
                    <tr key={proc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <Link
                          to={`/procedures/${proc.id}`}
                          className="font-medium text-gray-800 hover:text-primary line-clamp-1"
                        >
                          {proc.title}
                        </Link>
                        {proc.tags && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            🏷️ {proc.tags}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                        {proc.category || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={proc.status} />
                      </td>
                      <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                        {proc.createdBy || '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-400 hidden lg:table-cell">
                        {proc.createdAt
                          ? new Date(proc.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/procedures/${proc.id}`}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors min-h-[32px] flex items-center"
                          >
                            View
                          </Link>
                          <Link
                            to={`/procedures/${proc.id}/edit`}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-primary px-3 py-1.5 rounded transition-colors min-h-[32px] flex items-center"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteId(proc.id)}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded transition-colors min-h-[32px]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter((i) => Math.abs(i - page) <= 2)
                    .map((i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-1.5 text-sm border rounded min-h-[36px] ${
                          i === page
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Procedure</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this procedure? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Deleting...
                  </span>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
