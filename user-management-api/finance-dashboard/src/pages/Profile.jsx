import { useState } from 'react'
import api from '../api'

export default function Profile({ user, addToast }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      return addToast('New passwords do not match', 'error')
    }
    setLoading(true)
    try {
      const { data } = await api.put('/profile/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      })
      addToast(data.message)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      addToast(err.response?.data?.error || 'Something went wrong', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="page">
      <h2 className="page-title">Profile</h2>
      <div className="profile-grid">
        <div className="chart-card">
          <div className="chart-card-header"><h3>Account Info</h3></div>
          <div className="profile-info">
            <div className="profile-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div>
              <p className="profile-name">{user.name}</p>
              <p className="profile-email">{user.email || 'N/A'}</p>
              <span className={`badge ${user.role === 'admin' ? 'income' : 'expense'}`}>{user.role}</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header"><h3>Change Password</h3></div>
          <form onSubmit={submit} className="profile-form">
            <label>Current Password</label>
            <input type="password" placeholder="Enter current password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required />
            <label>New Password</label>
            <input type="password" placeholder="Min 8 chars, uppercase, number, special char" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
            <label>Confirm New Password</label>
            <input type="password" placeholder="Repeat new password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Update Password'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
