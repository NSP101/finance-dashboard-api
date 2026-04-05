import { useState } from 'react'
import api from '../api'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // login | register | forgot | reset
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer', resetToken: '', newPassword: '' })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      if (mode === 'register') {
        await api.post('/register', form)
        setMsg({ type: 'success', text: 'Registered successfully! Please login.' })
        setMode('login')
      } else if (mode === 'login') {
        const { data } = await api.post('/login', { email: form.email, password: form.password })
        onLogin(data)
      } else if (mode === 'forgot') {
        const { data } = await api.post('/forgot-password', { email: form.email })
        setMsg({ type: 'success', text: `Reset token: ${data.resetToken} (valid 15 mins)` })
        setMode('reset')
      } else if (mode === 'reset') {
        const { data } = await api.post('/reset-password', {
          email: form.email,
          resetToken: form.resetToken,
          newPassword: form.newPassword
        })
        setMsg({ type: 'success', text: data.message })
        setMode('login')
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Something went wrong' })
    }
    setLoading(false)
  }

  const titles = { login: 'Login', register: 'Register', forgot: 'Forgot Password', reset: 'Reset Password' }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>{titles[mode]}</h2>
        <p className="login-subtitle">Finance Dashboard</p>

        {msg && <div className={msg.type === 'success' ? 'success-msg' : 'error-msg'} style={{ marginBottom: 14 }}>{msg.text}</div>}

        <form onSubmit={submit}>
          {mode === 'register' && (
            <input name="name" placeholder="Full Name" value={form.name} onChange={handle} required />
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot' || mode === 'reset') && (
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handle} required />
          )}

          {(mode === 'login' || mode === 'register') && (
            <input name="password" type="password" placeholder={mode === 'register' ? 'Min 8 chars, uppercase, number, special char' : 'Password'} value={form.password} onChange={handle} required />
          )}

          {mode === 'register' && (
            <select name="role" value={form.role} onChange={handle}>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          )}

          {mode === 'reset' && (
            <>
              <input name="resetToken" placeholder="Enter reset token" value={form.resetToken} onChange={handle} required />
              <input name="newPassword" type="password" placeholder="New password (Min 8 chars, uppercase, number, special)" value={form.newPassword} onChange={handle} required />
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : titles[mode]}
          </button>
        </form>

        <div className="login-footer">
          {mode === 'login' && (
            <>
              <span onClick={() => { setMode('forgot'); setMsg(null) }}>Forgot password?</span>
              <span onClick={() => { setMode('register'); setMsg(null) }}>Create account</span>
            </>
          )}
          {(mode === 'register' || mode === 'forgot' || mode === 'reset') && (
            <span onClick={() => { setMode('login'); setMsg(null) }}>← Back to login</span>
          )}
        </div>
      </div>
    </div>
  )
}
