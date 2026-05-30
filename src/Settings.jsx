import { useState } from 'react'
import './Settings.css'

export default function Settings({ onClose, userState, onApply }) {
  const [closing, setClosing] = useState(false)
  const [name, setName] = useState(userState.pet.name)

  function handleClose() {
    setClosing(true)
    setTimeout(onClose, 200)
  }

  async function handleApply() {
    const newState = {
      ...userState,
      pet: {
        ...userState.pet,
        name: name.trim() || userState.pet.name,
      },
    }
    await chrome.storage.local.set({ userState: newState })
    onApply(newState)
  }

  return (
    <div className={`settings-screen ${closing ? 'settings-closing' : 'settings-opening'}`}>
      <div className="settings-header">
        <button className="settings-back-btn" onClick={handleClose}>
          <span className="settings-back-arrow">‹</span>
          <span className="settings-back-text">Back</span>
        </button>
        <div className="settings-title-pill">
          <span className="settings-title">Settings</span>
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div className="settings-body">
        <div className="settings-section-label">Pet</div>
        <div className="settings-card">
          <div className="settings-row">
            <label className="settings-label">Name</label>
            <input
              className="settings-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Pal"
            />
          </div>
        </div>

        <button className="settings-apply-btn" onClick={handleApply}>Apply</button>
      </div>
    </div>
  )
}
