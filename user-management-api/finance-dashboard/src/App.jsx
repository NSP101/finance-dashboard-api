import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Users from './pages/Users'
import Profile from './pages/Profile'
import Toast from './components/Toast'
import useToast from './hooks/useToast'
import './index.css'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [user, setUser] = useState(null)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const name = localStorage.getItem('name')
    if (token) setUser({ token, role, name })
  }, [])

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('name', data.name)
    setUser(data)
    setPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.clear()
    setUser(null)
    setPage('dashboard')
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <div className="app">
      <Toast toasts={toasts} removeToast={removeToast} />
      <nav className="navbar">
        <span className="nav-brand">Finance Dashboard</span>
        <div className="nav-links">
          <button onClick={() => setPage('dashboard')} className={page === 'dashboard' ? 'active' : ''}>Dashboard</button>
          <button onClick={() => setPage('transactions')} className={page === 'transactions' ? 'active' : ''}>Transactions</button>
          {user.role === 'admin' && (
            <button onClick={() => setPage('users')} className={page === 'users' ? 'active' : ''}>Users</button>
          )}
          <button onClick={() => setPage('profile')} className={page === 'profile' ? 'active' : ''}>Profile</button>
        </div>
        <div className="nav-user">
          <span>{user.name} <em>({user.role})</em></span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
      <main className="main-content">
        {page === 'dashboard' && <Dashboard role={user.role} onNavigate={setPage} />}
        {page === 'transactions' && <Transactions role={user.role} addToast={addToast} />}
        {page === 'users' && user.role === 'admin' && <Users addToast={addToast} />}
        {page === 'profile' && <Profile user={user} addToast={addToast} />}
      </main>
    </div>
  )
}
