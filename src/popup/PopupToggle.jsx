import { useState, useEffect } from 'react'
import './PopupToggle.css'

export default function PopupToggle() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chrome.storage.local.get('panelEnabled', ({ panelEnabled }) => {
      setEnabled(!!panelEnabled)
      setLoading(false)
    })
  }, [])

  async function toggle() {
    const next = !enabled
    setEnabled(next)
    chrome.storage.local.set({ panelEnabled: next })

    if (next) {
      await chrome.sidePanel.setOptions({ path: 'index.html', enabled: true })
      const win = await chrome.windows.getCurrent()
      await chrome.sidePanel.open({ windowId: win.id })
    } else {
      await chrome.sidePanel.setOptions({ enabled: false })
    }
  }

  return (
    <div className="popup-root">
      <span className="popup-logo">DoPal</span>
      <button
        className={`toggle-switch ${enabled ? 'on' : 'off'}`}
        onClick={toggle}
        disabled={loading}
        aria-label="Toggle side panel"
      >
        <span className="toggle-knob" />
      </button>
    </div>
  )
}
