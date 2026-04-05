import { useEffect } from 'react'

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : '⚠️'}</span>
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}
