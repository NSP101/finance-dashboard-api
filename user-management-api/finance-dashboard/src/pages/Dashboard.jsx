import { useEffect, useState } from 'react'
import api from '../api'
import EmptyState from '../components/EmptyState'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'

const COLORS = ['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899']

export default function Dashboard({ role, onNavigate }) {
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [monthly, setMonthly] = useState([])
  const [weekly, setWeekly] = useState([])
  const [recent, setRecent] = useState([])
  const canViewAnalytics = role === 'admin' || role === 'analyst'

  useEffect(() => {
    api.get('/dashboard/recent').then(r => setRecent(r.data)).catch(() => {})
    if (canViewAnalytics) {
      api.get('/dashboard/summary').then(r => setSummary(r.data)).catch(() => {})
      api.get('/dashboard/categories').then(r => setCategories(r.data)).catch(() => {})
      api.get('/dashboard/trends/monthly').then(r => {
        const map = {}
        r.data.forEach(({ month, type, total }) => {
          if (!map[month]) map[month] = { month }
          map[month][type] = total
        })
        setMonthly(Object.values(map).reverse())
      }).catch(() => {})
      api.get('/dashboard/trends/weekly').then(r => {
        const map = {}
        r.data.forEach(({ week, type, total }) => {
          if (!map[week]) map[week] = { week }
          map[week][type] = total
        })
        setWeekly(Object.values(map).reverse())
      }).catch(() => {})
    }
  }, [])

  const pieData = categories.reduce((acc, { category, total }) => {
    const existing = acc.find(a => a.name === category)
    if (existing) existing.value += total
    else acc.push({ name: category, value: total })
    return acc
  }, [])

  return (
    <div className="page">
      <h2 className="page-title">Dashboard</h2>

      {!canViewAnalytics && (
        <div className="viewer-banner">
          <span>👋 You are logged in as a <strong>Viewer</strong>. You can view transactions and recent activity. Contact an admin to upgrade your access.</span>
        </div>
      )}

      {canViewAnalytics && summary && (
        <div className="summary-cards">
          <div className="widget green" onClick={() => onNavigate('transactions')} style={{ cursor: 'pointer' }}>
            <div className="widget-icon">💰</div>
            <div className="widget-info">
              <p>Total Income</p>
              <h3>₹{summary.total_income.toLocaleString()}</h3>
            </div>
          </div>
          <div className="widget red" onClick={() => onNavigate('transactions')} style={{ cursor: 'pointer' }}>
            <div className="widget-icon">📉</div>
            <div className="widget-info">
              <p>Total Expenses</p>
              <h3>₹{summary.total_expenses.toLocaleString()}</h3>
            </div>
          </div>
          <div className="widget blue" onClick={() => onNavigate('transactions')} style={{ cursor: 'pointer' }}>
            <div className="widget-icon">🏦</div>
            <div className="widget-info">
              <p>Net Balance</p>
              <h3>₹{summary.net_balance.toLocaleString()}</h3>
            </div>
          </div>
          <div className="widget purple" onClick={() => onNavigate('transactions')} style={{ cursor: 'pointer' }}>
            <div className="widget-icon">📊</div>
            <div className="widget-info">
              <p>Transactions</p>
              <h3>{recent.length}+</h3>
            </div>
          </div>
        </div>
      )}

      <div className="charts-grid">
        {canViewAnalytics && monthly.length > 0 && (
          <div className="chart-card wide">
            <div className="chart-card-header">
              <h3>Monthly Trends</h3>
              <span className="chart-badge">Last 24 months</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthly} barGap={4}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {canViewAnalytics && pieData.length > 0 && (
          <div className="chart-card">
            <div className="chart-card-header">
              <h3>Category Breakdown</h3>
              <span className="chart-badge">{pieData.length} categories</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {pieData.map((item, i) => (
                <div key={i} className="pie-legend-item">
                  <span className="pie-legend-dot" style={{ background: COLORS[i % COLORS.length] }}></span>
                  <span className="pie-legend-name">{item.name}</span>
                  <span className="pie-legend-value">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {canViewAnalytics && weekly.length > 0 && (
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Weekly Trends</h3>
            <span className="chart-badge">Last 8 weeks</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} barGap={4}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="chart-card">
        <div className="chart-card-header">
          <h3>Recent Activity</h3>
          <span className="chart-badge">{recent.length} transaction{recent.length !== 1 ? 's' : ''}</span>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon="💸" title="No transactions yet" subtitle="Add your first transaction to see activity here" />
        ) : (
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Category</th><th>Type</th><th>Amount</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {recent.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.category}</td>
                  <td><span className={`badge ${t.type}`}>{t.type}</span></td>
                  <td style={{ fontWeight: 600, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </td>
                  <td>{t.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
