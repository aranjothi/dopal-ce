const DEFAULT_PET = {
  name: 'Pal',
  level: 1,
  xp: 0,
  hunger: 100,
  mood: 100,
  lastActiveAt: Date.now(),
}

async function getState() {
  const result = await chrome.storage.local.get('userState')
  if (result.userState) return result.userState

  const initial = {
    id: crypto.randomUUID(),
    coins: 0,
    pet: { ...DEFAULT_PET },
  }
  await chrome.storage.local.set({ userState: initial })
  return initial
}

async function saveState(state) {
  await chrome.storage.local.set({ userState: state })
}

async function getActiveTask() {
  const result = await chrome.storage.local.get('activeTask')
  return result.activeTask ?? null
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  ;(async () => {
    switch (message.type) {
      case 'GET_STATE': {
        sendResponse({ type: 'STATE', payload: await getState() })
        break
      }
      case 'GET_ACTIVE_TASK': {
        sendResponse({ type: 'ACTIVE_TASK', payload: await getActiveTask() })
        break
      }
      case 'START_TASK': {
        const task = {
          label: message.payload.label,
          startedAt: Date.now(),
          durationMs: message.payload.durationMs,
        }
        await chrome.storage.local.set({ activeTask: task })
        chrome.alarms.create('taskComplete', {
          delayInMinutes: message.payload.durationMs / 60_000,
        })
        sendResponse({ type: 'TASK_STARTED' })
        break
      }
      case 'STOP_TASK': {
        await chrome.storage.local.remove('activeTask')
        chrome.alarms.clear('taskComplete')
        sendResponse({ type: 'TASK_STOPPED' })
        break
      }
    }
  })()
  return true
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'taskComplete') return

  const [state, task] = await Promise.all([getState(), getActiveTask()])
  if (!task) return

  const minutes = task.durationMs / 60_000
  state.coins += Math.floor(minutes)
  state.pet.xp += Math.floor(minutes * 10)
  state.pet.lastActiveAt = Date.now()

  const xpNeeded = state.pet.level * 100
  if (state.pet.xp >= xpNeeded) {
    state.pet.xp -= xpNeeded
    state.pet.level += 1
  }

  await Promise.all([
    saveState(state),
    chrome.storage.local.remove('activeTask'),
  ])
})
