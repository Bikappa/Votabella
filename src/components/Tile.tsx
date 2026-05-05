import { LockClosedIcon, LockOpenIcon, MinusIcon, PlusIcon } from "@heroicons/react/16/solid"
import { DeltaButton } from "./DeltaButton"
import { useCallback, useEffect, useRef, useState } from "react";
import { IntervalIndicator } from "./IntervalIndicator";

export type Props = {
    grade: number,
    title: string,
    autoIncreaseInterval: number,
    autoIncreaseDelta: number,
    minGrade: number,
    label: string,
    locked: boolean,
    onLockToggle: () => void,
    onLabelChange: (label: string) => void,
    onChange?: (arg0: number) => void
}
function clampGrade(grade: number, minGrade = 0) {
    return Math.min(10, Math.max(minGrade, grade))
}
const stops = [
    [0, [24, 10, 18], [88, 6, 22]],
    [5, [127, 29, 29], [220, 38, 38]],
    [6, [4, 120, 87], [101, 163, 13]],
    [8, [20, 184, 166], [125, 211, 252]],
    [9, [99, 102, 241], [226, 232, 240]],
    [10, [14, 165, 233], [217, 70, 239]],
] as const
function mix(a: readonly number[], b: readonly number[], t: number) {
    return a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(' ')
}
function tileBg(grade: number) {
    const hi = stops.findIndex(([g]) => grade <= g)
    const [g1, a1, b1] = stops[Math.max(0, hi - 1)]
    const [g2, a2, b2] = stops[hi < 0 ? stops.length - 1 : hi]
    const t = g1 === g2 ? 0 : (grade - g1) / (g2 - g1)
    return `linear-gradient(135deg, rgb(${mix(a1, a2, t)}), rgb(${mix(b1, b2, t)}))`
}

export function Tile({grade, onChange, title, autoIncreaseInterval, autoIncreaseDelta, minGrade, label, locked, onLockToggle, onLabelChange}: Props) {
    const bg = tileBg(grade);
    const iid = useRef<number>(0)
    const tid = useRef<number>(0)
    const left = useRef(autoIncreaseInterval)
    const [timeLeft, setTimeLeft] = useState(autoIncreaseInterval)
    const [timerVersion, setTimerVersion] = useState(0)
    const [active, setActive] = useState(false)
    const nextAutoGrade = clampGrade(grade + autoIncreaseDelta, minGrade)
    const controlClass = active ? '' : 'hidden group-hover:block'

    const resetTimer = useCallback(() => {
        left.current = autoIncreaseInterval
        setTimeLeft(autoIncreaseInterval)
        setTimerVersion((prev) => prev + 1)
    }, [autoIncreaseInterval])

    useEffect(() => {
        if(iid.current !== 0){
            window.clearInterval(iid.current)
        }
        if(tid.current !== 0){
            window.clearTimeout(tid.current)
        }
        if(locked || grade === 10){
            return
        }
        const startedAt = Date.now()
        const startedLeft = left.current
        tid.current = window.setTimeout(() => {
            onChange?.(nextAutoGrade)
            resetTimer()
        }, startedLeft)
        iid.current = window.setInterval(() => {
            const nextLeft = Math.max(0, startedLeft - (Date.now() - startedAt))
            left.current = nextLeft
            setTimeLeft(nextLeft)
        }, 50)
        return () => {
            window.clearInterval(iid.current)
            window.clearTimeout(tid.current)
            iid.current = 0
            tid.current = 0
        }
    }, [locked, nextAutoGrade, grade, onChange, resetTimer, timerVersion])

    const wrappedOnChange = useCallback(
        (newGrade: number) => {
            onChange?.(clampGrade(newGrade, minGrade))
            if(!locked){
                resetTimer()
            }
        },
        [locked, minGrade, onChange, resetTimer],
    )
    const gradeOptions = (() => {
        const values = [];
        for(let i=minGrade; i<=10; i+=0.25){
            values.push(i)
        }
        if(!values.includes(grade)){
            values.push(grade)
        }
        return values.sort((a, b) => b - a)
    })()

    return <div className="
        relative
        p-1.5
        accent-black 
        min-h-0 
        text-center 
        text-2xl
        group"
        onPointerDown={() => setActive(true)}
        onBlur={(e) => {
            if(!e.currentTarget.contains(e.relatedTarget)){
                setActive(false)
            }
        }}
        tabIndex={-1}
    >
        {grade !== 10 && <IntervalIndicator period={autoIncreaseInterval} left={timeLeft} />}
        <div className="relative flex h-full min-h-32 items-center justify-center rounded-xl p-6" style={{ background: bg }}>
        <button className={`absolute top-1 right-1 z-10 size-6 cursor-pointer opacity-70 hover:opacity-100 ${locked ? '' : controlClass}`} onClick={onLockToggle} title={locked ? 'Unlock tile' : 'Lock tile'}>
            {locked ? <LockClosedIcon /> : <LockOpenIcon />}
        </button>
        <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col w-full items-center justify-center gap-1">
            <input className="w-20 min-w-0 rounded bg-transparent px-1 text-sm text-gray-200 outline-none focus:bg-black/25 focus:outline focus:outline-1 focus:outline-white/60 text-center" value={label} onChange={(e) => onLabelChange(e.target.value)} />
            <span className="text-xl font-medium text-gray-300 text-shadow-xs">{title}</span>
        </div>
        <div className="flex gap-1 items-center">
              <div className={controlClass}>
                <DeltaButton disabled={grade <= minGrade} title="Decrease grade" onClick={() => wrappedOnChange?.(grade - 0.25)}><MinusIcon /></DeltaButton>
            </div>
                <select 
        className="text-4xl text-gray-300 text-center bg-none appearance-none p-0 text-shadow-lg "
        value={grade}
        onChange={(e) => wrappedOnChange?.(parseFloat(e.target.value))}>
            {gradeOptions.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <div className={controlClass}>
                <DeltaButton disabled={grade >= 10} title="Increase grade" onClick={() => wrappedOnChange?.(grade + 0.25)}><PlusIcon /></DeltaButton>
            </div>
          
        </div>
        
        
        </div>
        </div>

    </div>
}
