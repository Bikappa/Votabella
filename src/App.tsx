import { useMemo, useState } from 'react'
import { Tile } from './components/Tile'

const DEFAULT_TILE_COUNT = 20
const DEFAULT_AUTO_INCREASE_INTERVAL = 20000
const DEFAULT_AUTO_INCREASE_DELTA = 0.25

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

  return {
    tileCount: Math.max(1, tileCount),
    autoIncreaseInterval: getNumberParam(params, ['interval', 'period', 'autoInterval'], DEFAULT_AUTO_INCREASE_INTERVAL),
    autoIncreaseDelta: getNumberParam(params, ['delta', 'autoDelta'], DEFAULT_AUTO_INCREASE_DELTA),
  }
}

function App() {
  const config = useMemo(() => getAppConfig(), [])

  const [grades, setGrades] = useState(() =>
    Object.fromEntries(
      Array.from({ length: config.tileCount }, (_, i) => [
        String(i),
        Math.round(Math.random() * 10 * 4) / 4,
      ]),
    ),
  )

  return (
    <div className='flex items-center justify-center gap-8 flex-wrap h-full'>
      {Object.entries(grades).map(([key, score]) => {
        return (
          <Tile
            key={`tile-${key}`}
            grade={score}
            title={key}
            autoIncreaseInterval={config.autoIncreaseInterval}
            autoIncreaseDelta={config.autoIncreaseDelta}
            onChange={(newGrade) => setGrades((prev) => ({
              ...prev,
              [key]: newGrade,
            }))}
          />
        )
      })}
    </div>
  )
}

export default App
