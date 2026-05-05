import { useEffect, useMemo, useState } from 'react'
import { Tile } from './components/Tile'
import { ArrowPathIcon, Cog6ToothIcon, LockClosedIcon, LockOpenIcon, MinusIcon, PlusIcon } from '@heroicons/react/16/solid'

const DEFAULT_TILE_COUNT = 20
const DEFAULT_AUTO_INCREASE_INTERVAL = 20000
const DEFAULT_AUTO_INCREASE_DELTA = 0.25
const DEFAULT_MIN_GRADE = 0

function getNumberParam(params: URLSearchParams, names: string[], fallback: number) {
  for (const name of names) {
    const value = params.get(name)

    if (value === null) {
      continue
    }

    const parsed = Number(value)

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return fallback
}

function getAppConfig() {
  const params = new URLSearchParams(window.location.search)
  const tileCount = Math.floor(getNumberParam(params, ['tiles', 'tileCount', 'count'], DEFAULT_TILE_COUNT))
  const minGrade = Number(params.get('minGrade') ?? DEFAULT_MIN_GRADE)

  return {
    tileCount: Math.max(1, tileCount),
    autoIncreaseInterval: getNumberParam(params, ['interval', 'period', 'autoInterval'], DEFAULT_AUTO_INCREASE_INTERVAL),
    autoIncreaseDelta: getNumberParam(params, ['delta', 'autoDelta'], DEFAULT_AUTO_INCREASE_DELTA),
    minGrade: Math.min(10, Math.max(0, Number.isFinite(minGrade) ? minGrade : DEFAULT_MIN_GRADE)),
  }
}

function App() {
  const config = useMemo(() => getAppConfig(), [])
  const keys = useMemo(() => Array.from({ length: config.tileCount }, (_, i) => String(i+1)), [config.tileCount])
  const storageKey = useMemo(() => `votabella:${window.location.search}`, [])
  const savedState = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    } catch {
      return null
    }
  }, [storageKey])

  const [grades, setGrades] = useState(() =>
    Object.fromEntries(keys.map((key) => [key, Math.max(config.minGrade, Number(savedState?.grades?.[key]) || config.minGrade)])),
  )
  const [lockedTiles, setLockedTiles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(keys.map((key) => [key, !!savedState?.lockedTiles?.[key]])),
  )
  const [resetVersion, setResetVersion] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({
    interval: String(config.autoIncreaseInterval / 1000),
    minGrade: String(config.minGrade),
    tiles: String(config.tileCount),
  })
  const allLocked = Object.keys(grades).every((key) => lockedTiles[key])
  const resetAll = () => {
    setGrades(Object.fromEntries(keys.map((key) => [key, config.minGrade])))
    setLockedTiles({})
    setResetVersion((prev) => prev + 1)
  }
  const changeAll = (delta: number) => setGrades((prev) =>
    Object.fromEntries(keys.map((key) => [key, Math.min(10, Math.max(config.minGrade, prev[key] + delta))])),
  )
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({grades, lockedTiles}))
  }, [grades, lockedTiles, storageKey])
  const applySettings = () => {
    const params = new URLSearchParams(window.location.search)
    params.set('interval', String(Math.max(1, Number(settings.interval) || config.autoIncreaseInterval / 1000) * 1000))
    params.set('minGrade', String(Math.min(10, Math.max(0, Number(settings.minGrade) || 0))))
    params.set('tiles', String(Math.max(1, Math.floor(Number(settings.tiles) || config.tileCount))))
    alert('The URL will change and saved grades/locks will reset for the new settings.')
    window.location.search = params.toString()
  }

  return (
    <div className='flex min-h-screen flex-col items-center gap-4 bg-[radial-gradient(circle_at_20%_15%,#334155_0,#111827_34%,#020617_72%),linear-gradient(135deg,#0f172a,#18181b)] p-4'>
      <div className="flex shrink-0 items-center gap-2 rounded p-2">
        <button
          className="size-10 border border-white/70 hover:border-white rounded opacity-70 hover:opacity-100 cursor-pointer"
          onClick={resetAll}
        >
          <ArrowPathIcon />
        </button>
        <button
          className="size-10 border border-white/70 hover:border-white rounded opacity-70 hover:opacity-100 cursor-pointer"
          onClick={() => setLockedTiles(Object.fromEntries(Object.keys(grades).map((key) => [key, !allLocked])))}
        >
          {allLocked ? <LockClosedIcon /> : <LockOpenIcon />}
        </button>
        <button
          className="size-10 border border-white/70 hover:border-white rounded opacity-70 hover:opacity-100 cursor-pointer"
          onClick={() => changeAll(-config.autoIncreaseDelta)}
        >
          <MinusIcon />
        </button>
        <button
          className="size-10 border border-white/70 hover:border-white rounded opacity-70 hover:opacity-100 cursor-pointer"
          onClick={() => changeAll(config.autoIncreaseDelta)}
        >
          <PlusIcon />
        </button>
        <button
          className="size-10 border border-white/70 hover:border-white rounded opacity-70 hover:opacity-100 cursor-pointer"
          onClick={() => setSettingsOpen(true)}
        >
          <Cog6ToothIcon />
        </button>
      </div>
      {settingsOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="flex w-80 flex-col gap-4 rounded bg-zinc-900 p-4 text-gray-200">
            <p>Changing settings updates the URL and resets grades/locks.</p>
            <label className="flex flex-col gap-1">Tiles<input className="rounded bg-zinc-800 p-2" type="number" min="1" value={settings.tiles} onChange={(e) => setSettings((prev) => ({...prev, tiles: e.target.value}))} /></label>
            <label className="flex flex-col gap-1">Delay (seconds)<input className="rounded bg-zinc-800 p-2" type="number" min="1" value={settings.interval} onChange={(e) => setSettings((prev) => ({...prev, interval: e.target.value}))} /></label>
            <label className="flex flex-col gap-1">Minimum grade<input className="rounded bg-zinc-800 p-2" type="number" min="0" max="10" step="0.25" value={settings.minGrade} onChange={(e) => setSettings((prev) => ({...prev, minGrade: e.target.value}))} /></label>
            <div className="flex justify-end gap-2">
              <button className="rounded border border-white/50 px-3 py-2 cursor-pointer" onClick={() => setSettingsOpen(false)}>Cancel</button>
              <button className="rounded border border-white/50 px-3 py-2 cursor-pointer" onClick={applySettings}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      <div className='grid w-full flex-1 justify-center gap-4' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 12rem))' }}>
        {Object.entries(grades).map(([key, score]) => (
            <Tile
              key={`tile-${key}-${resetVersion}`}
              grade={score}
              title={key}
              locked={!!lockedTiles[key]}
              onLockToggle={() => setLockedTiles((prev) => ({...prev, [key]: !prev[key]}))}
              autoIncreaseInterval={config.autoIncreaseInterval}
              autoIncreaseDelta={config.autoIncreaseDelta}
              minGrade={config.minGrade}
              onChange={(newGrade) => setGrades((prev) => ({...prev, [key]: newGrade}))}
            />
        ))}
      </div>
    </div>
  )
}

export default App
