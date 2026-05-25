import { useState } from 'react'
import './Tasks.css'

export default function Tasks({ onClose }) {
  const [closing, setClosing] = useState(false)

  function handleClose() {
    setClosing(true)
    setTimeout(() => onClose(), 220)
  }

  return (
    <div className={`tasks-screen ${closing ? 'tasks-closing' : 'tasks-opening'}`}>
      <div className="tasks-header">
        <button className="tasks-back-btn" onClick={handleClose}>
          <span className="back-text">← Back</span>
        </button>
        <div className="tasks-title-pill">
          <span className="tasks-title">To-Dos</span>
        </div>
        <button className="tasks-new-pill">+ New</button>
      </div>
    </div>
  )
}
