import { useEffect, useState } from 'react'
import api from '../api'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

const empty = { amount: '', type: 'income', category: '', date: '', notes: '' }

export default function Transactions({ role, addToast }) {
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' })
  const [sort, setSort] = useState({ sortBy: 'date', sortOrder: 'DESC' })
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const limit = 5
  const isAdmin = role === 'admin'
  const totalPages = Math.ceil(total / limit)

  const load = async () => {
    setLoading(true)
    const params = { page, limit, ...sort }
    if (filters.type) params.type = filters.type
    if (filters.category) params.category = filters.category
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    try {
      const r = await api.get('/transactions', { params })
      setData(r.data.data)
      setTotal(r.data.total)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [filters, page, sort])

  const handleSort = (col) => {
    setSort(prev => ({ sortBy: col, sortOrder: prev.sortBy === col && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC' }))
    setPage(1)
  }

  const SortIcon = ({ col }) => {
    if (sort.sortBy !== col) return <span style={{ color: '#cbd5e1', marginLeft: 4 }}>↕</span>
    return <span style={{ marginLeft: 4 }}>{sort.sortOrder === 'ASC' ? '↑' : '↓'}</span>
  }

  const submit = async e => {
    e.preventDefault(); setError('')
    try {
      if (editId) await api.put(`/transactions/${editId}`, form)
      else await api.post('/transactions', form)
      addToast(editId ? 'Transaction updated' : 'Transaction created')
      setForm(empty); setEditId(null); setShowForm(false); load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving transaction')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this transaction?')) return
    try {
      await api.delete(`/transactions/${id}`)
      addToast('Transaction deleted', 'success')
      load()
    } catch {
      addToast('Failed to delete', 'error')
    }
  }

  const startEdit = (t) => {
    setForm({ amount: t.amount, type: t.type, category: t.category, date: t.date, notes: t.notes || '' })
    setEditId(t.id); setShowForm(true)
  }

  const handleFilterChange = (newFilters) => { setFilters(newFilters); setPage(1) }

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Category', 'Type', 'Amount', 'Notes']
    const rows = data.map(t => [t.id, t.date, t.category, t.type, t.amount, t.notes || ''])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'transactions.csv'; a.click()
    URL.revokeObjectURL(url)
    addToast('CSV exported successfully')
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Transactions</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-export" onClick={exportCSV}>⬇ Export CSV</button>
          {isAdmin && <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty) }}>+ Add Transaction</button>}
        </div>
      </div>

      {showForm && isAdmin && (
        <div className="form-box">
          <h3>{editId ? 'Edit Transaction' : 'New Transaction'}</h3>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={submit} className="inline-form">
            <input placeholder="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <select value={filters.type} onChange={e => handleFilterChange({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input placeholder="Category" value={filters.category} onChange={e => handleFilterChange({ ...filters, category: e.target.value })} />
        <input type="date" value={filters.startDate} onChange={e => handleFilterChange({ ...filters, startDate: e.target.value })} />
        <input type="date" value={filters.endDate} onChange={e => handleFilterChange({ ...filters, endDate: e.target.value })} />
        <button onClick={() => handleFilterChange({ type: '', category: '', startDate: '', endDate: '' })}>Clear</button>
      </div>

      <div className="chart-card">
        {loading ? <Spinner /> : data.length === 0 ? (
          <EmptyState icon="💸" title="No transactions found" subtitle="Try adjusting your filters or add a new transaction" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('date')}>Date <SortIcon col="date" /></th>
                <th className="sortable" onClick={() => handleSort('category')}>Category <SortIcon col="category" /></th>
                <th className="sortable" onClick={() => handleSort('type')}>Type <SortIcon col="type" /></th>
                <th className="sortable" onClick={() => handleSort('amount')}>Amount <SortIcon col="amount" /></th>
                <th>Notes</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.category}</td>
                  <td><span className={`badge ${t.type}`}>{t.type}</span></td>
                  <td style={{ fontWeight: 600, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </td>
                  <td>{t.notes || '-'}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn-sm" onClick={() => startEdit(t)}>Edit</button>
                      <button className="btn-sm danger" onClick={() => remove(t.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
            <span>Page {page} of {totalPages} &nbsp;|&nbsp; {total} records</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
