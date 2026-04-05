import { useEffect, useState } from 'react'
import api from '../api'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

const emptyUser = { name: '', email: '', password: '', role: 'viewer' }

export default function Users({ addToast }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'ASC' })
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyUser)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/users', { params: { search, limit: 20 } })
      let rows = r.data.data || []
      rows = [...rows].sort((a, b) => {
        const valA = a[sort.sortBy]?.toString().toLowerCase() || ''
        const valB = b[sort.sortBy]?.toString().toLowerCase() || ''
        return sort.sortOrder === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      })
      setUsers(rows)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [search, sort])

  const handleSort = (col) => {
    setSort(prev => ({ sortBy: col, sortOrder: prev.sortBy === col && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC' }))
  }

  const SortIcon = ({ col }) => {
    if (sort.sortBy !== col) return <span style={{ color: '#cbd5e1', marginLeft: 4 }}>↕</span>
    return <span style={{ marginLeft: 4 }}>{sort.sortOrder === 'ASC' ? '↑' : '↓'}</span>
  }

  const addUser = async e => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/register', form)
      addToast(`User ${form.name} added successfully`)
      setForm(emptyUser)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add user')
    }
  }

  const updateRole = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role })
      addToast(`Role updated to ${role}`)
      load()
    } catch { addToast('Failed to update role', 'error') }
  }

  const toggleStatus = async (id, status) => {
    const newStatus = status === 'active' ? 'inactive' : 'active'
    try {
      await api.put(`/users/${id}`, { status: newStatus })
      addToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
      load()
    } catch { addToast('Failed to update status', 'error') }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">User Management</h2>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setError('') }}>+ Add User</button>
      </div>

      {showForm && (
        <div className="form-box">
          <h3>New User</h3>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={addUser} className="inline-form">
            <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <input type="password" placeholder="Password (Min 8, uppercase, number, special)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="chart-card">
        {loading ? <Spinner /> : users.length === 0 ? (
          <EmptyState icon="👥" title="No users found" subtitle="Try a different search term" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('name')}>Name <SortIcon col="name" /></th>
                <th className="sortable" onClick={() => handleSort('email')}>Email <SortIcon col="email" /></th>
                <th className="sortable" onClick={() => handleSort('role')}>Role <SortIcon col="role" /></th>
                <th className="sortable" onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}>
                      <option value="viewer">Viewer</option>
                      <option value="analyst">Analyst</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td><span className={`badge ${u.status === 'active' ? 'income' : 'expense'}`}>{u.status}</span></td>
                  <td>
                    <button className={`btn-sm ${u.status === 'active' ? 'danger' : ''}`} onClick={() => toggleStatus(u.id, u.status)}>
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
