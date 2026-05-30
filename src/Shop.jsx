import { useState } from 'react'
import coinImg  from './assets/ui/coin.png'
import treatImg from './assets/ui/treat.png'
import './Shop.css'

function formatNum(n) {
  if (n >= 1_000_000) return `${Math.floor(n / 1_000_000)}M+`
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K+`
  return String(n)
}

function balanceFontSize(n) {
  const len = formatNum(n).length
  if (len >= 5) return '10px'
  if (len >= 4) return '11.5px'
  return '13px'
}

const ITEMS = [
  {
    id: 'treat',
    name: 'Treat',
    desc: 'Restores 10 hunger',
    cost: 10,
    img: treatImg,
  },
]

export default function Shop({ onClose, userState, onUpdate }) {
  const [closing, setClosing] = useState(false)
  const [busy, setBusy] = useState(false)

  function handleClose() {
    setClosing(true)
    setTimeout(onClose, 200)
  }

  async function handleBuy(item) {
    if (userState.coins < item.cost || busy) return
    setBusy(true)
    const res = await chrome.runtime.sendMessage({ type: 'BUY_TREAT' })
    if (res.type === 'BUY_TREAT_SUCCESS') onUpdate(res.payload)
    setBusy(false)
  }

  const coins = userState.coins ?? 0

  return (
    <div className={`shop-screen ${closing ? 'shop-closing' : 'shop-opening'}`}>
      <div className="shop-header">
        <button className="shop-back-btn" onClick={handleClose}>
          <span className="shop-back-text">← Back</span>
        </button>
        <div className="shop-title-pill">
          <span className="shop-title">Shop</span>
        </div>
        <div className="shop-balance">
          <img src={coinImg} className="shop-balance-icon" alt="" />
          <span style={{ fontSize: balanceFontSize(coins) }}>{formatNum(coins)}</span>
        </div>
      </div>

      <div className="shop-body">
        {ITEMS.map(item => (
          <div key={item.id} className="shop-item-card">
            <img src={item.img} className="shop-item-img" alt={item.name} />
            <div className="shop-item-info">
              <span className="shop-item-name">{item.name}</span>
              <span className="shop-item-desc">{item.desc}</span>
            </div>
            <button
              className="shop-buy-btn"
              onClick={() => handleBuy(item)}
              disabled={coins < item.cost || busy}
            >
              <img src={coinImg} className="shop-buy-coin" alt="" />
              {item.cost}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
