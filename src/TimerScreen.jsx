import { useState, useEffect, useRef } from 'react'
import { IoMdAlarm } from 'react-icons/io'
import coinImg from './assets/ui/coin.png'
import './TimerScreen.css'


const TASK_COLOR_MAP = [
  { hex: '#fca5a5', dark: '#7f1d1d' },
  { hex: '#fdba74', dark: '#7c2d12' },
  { hex: '#fde68a', dark: '#713f12' },
  { hex: '#86efac', dark: '#14532d' },
  { hex: '#93c5fd', dark: '#1e3a8a' },
  { hex: '#d8b4fe', dark: '#4c1d95' },
  { hex: '#d1d5db', dark: '#1f2937' },
]

function resolveColors(task) {
  if (!task.color) return { pastel: '#b1cff3', dark: '#1e3a70' }
  const entry = TASK_COLOR_MAP.find(c => c.hex === task.color)
  return { pastel: task.color, dark: entry?.dark ?? '#1e3a70' }
}

function taskTotalSeconds(task) {
  if (task.type === 'task') {
    const [h, m, s] = (task.timeAllotted ?? '00:00:00').split(':').map(Number)
    return h * 3600 + m * 60 + s
  }
  if (task.breaks) return (task.studyInterval ?? 0) * (task.numIntervals ?? 0) * 60
  return (task.duration ?? 0) * 60
}

function formatSeconds(total) {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

function EndEarlyModal({ coins, onFinishEarly, onContinue }) {
  return (
    <div className="end-early-backdrop">
      <div className="end-early-modal">
        <p className="end-early-title">End session early?</p>
        <button className="end-early-finish-btn" onClick={onFinishEarly}>
          <span>Finish Early</span>
          <span className="end-early-coins">
            <img src={coinImg} alt="coin" className="end-early-coin-img" />
            <span>{coins}</span>
          </span>
        </button>
        <button className="end-early-continue-btn" onClick={onContinue}>Continue Working</button>
      </div>
    </div>
  )
}

export default function TimerScreen({ task, onFinish, onMinimize, startedAt }) {
  const totalSeconds = taskTotalSeconds(task)
  const computeInitial = () => startedAt
    ? Math.max(0, totalSeconds - Math.floor((Date.now() - startedAt) / 1000))
    : totalSeconds
  const initialSeconds = computeInitial()
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [expired, setExpired] = useState(initialSeconds === 0)
  const [showEndEarly, setShowEndEarly] = useState(false)
  const [snapshotCoins, setSnapshotCoins] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!expired) return
    const actx = new AudioContext()

    function scheduleChime() {
      const notes = [523.25, 659.25, 783.99, 1046.50]
      notes.forEach((freq, i) => {
        const osc = actx.createOscillator()
        const gain = actx.createGain()
        osc.connect(gain)
        gain.connect(actx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        const t = actx.currentTime + i * 0.2
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0)
        osc.start(t)
        osc.stop(t + 1.0)
      })
    }

    scheduleChime()
    const id = setInterval(scheduleChime, 4000)
    return () => {
      clearInterval(id)
      actx.close()
    }
  }, [expired])

  useEffect(() => {
    if (initialSeconds === 0) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const totalCoins = Math.floor(totalSeconds / 60)
  const { pastel, dark } = resolveColors(task)

  function handleEndEarlyClick() {
    const elapsed = totalSeconds - secondsLeft
    setSnapshotCoins(Math.floor(elapsed / 60))
    setShowEndEarly(true)
  }

  return (
    <div className="timer-screen">
      <div
        className="timer-container"
        style={{ background: pastel, border: `2px solid ${dark}50` }}
      >
        <div
          className="timer-title-pill"
          style={{ background: dark + '22', border: `1.5px solid ${dark}40` }}
        >
          <span className="timer-title-text" style={{ color: dark }}>{task.title}</span>
        </div>

        <div className="timer-clock-area">
          <IoMdAlarm
            className={`timer-clock-icon${expired ? ' timer-clock-expired' : ''}`}
            style={{ color: dark }}
          />
          <span className="timer-time-display" style={{ color: dark }}>
            {formatSeconds(secondsLeft)}
          </span>
        </div>

        <div className="timer-btn-group">
          <button
            className="timer-minimize-btn"
            style={{ color: dark, borderColor: dark + '50' }}
            onClick={onMinimize}
          >
            Minimize
          </button>

          {expired ? (
            <button
              className="timer-finish-btn"
              style={{ background: dark }}
              onClick={() => onFinish(totalCoins)}
            >
              Finish
            </button>
          ) : (
            <button className="timer-end-btn" onClick={handleEndEarlyClick}>End Early</button>
          )}
        </div>
      </div>

      {showEndEarly && (
        <EndEarlyModal
          coins={snapshotCoins}
          onFinishEarly={() => onFinish(snapshotCoins)}
          onContinue={() => setShowEndEarly(false)}
        />
      )}
    </div>
  )
}
