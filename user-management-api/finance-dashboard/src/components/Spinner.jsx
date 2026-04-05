export default function Spinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  )
}
