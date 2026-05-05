import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid"
import { DeltaButton } from "./DeltaButton"
import { useCallback, useEffect, useRef, useState } from "react";
import { IntervalIndicator } from "./IntervalIndicator";

export type Props = {
    grade: number,
    title: string,
    autoIncreaseInterval: number,
    autoIncreaseDelta: number,
    onChange?: (arg0: number) => void
}
function clampGrade(grade: number) {
    return Math.min(10, Math.max(0, grade))
}

export function Tile({grade, onChange, title, autoIncreaseInterval, autoIncreaseDelta}: Props) {
    const bg = grade < 6 ? 'from-rose-900/50 to-pink-700/50' : 'from-emerald-700/50 to-lime-700/50';
    const iid = useRef<number>(0)
    const [indicatorKey, setIndicatorKey] = useState<number>(0)
    const nextAutoGrade = clampGrade(grade + autoIncreaseDelta)

    const resetInterval = useCallback(() => {
        if(iid.current !== 0){
            window.clearInterval(iid.current)
        } 
        iid.current = setInterval(() =>{
            onChange?.(nextAutoGrade)
            setIndicatorKey((prev) => prev + 1)
        }, autoIncreaseInterval);

    }, [autoIncreaseInterval, nextAutoGrade, onChange])

    const wrappedOnChange = useCallback(
        (newGrade: number) => {
            onChange?.(clampGrade(newGrade))
            resetInterval()
            setIndicatorKey((prev) => prev + 1)
        },
        [onChange, resetInterval],
    )
    const gradeOptions = (() => {
        const values = [];
        for(let i=0; i<=10; i+=0.25){
            values.push(i)
        }
        if(!values.includes(grade)){
            values.push(grade)
        }
        return values.sort((a, b) => b - a)
    })()

    useEffect(() => {
        resetInterval()
        return () => {
            if(iid.current !== 0){
                window.clearInterval(iid.current)
                iid.current = 0
            }
        }
    }, [resetInterval])

    return <div className={`
        bg-gradient-to-b
        ${bg}
        rounded
        border 
        border-white/70
        hover:border-white
        accent-black w-[calc(var(--text-2xl)*4)] text-center text-2xl p-4
        group`}>
        <div className="flex flex-col items-center gap-2">
            <IntervalIndicator period={autoIncreaseInterval} key={indicatorKey} />
        <span className="text-sm font-medium text-gray-300">{title}</span>
        <div className="group-hover:opacity-100 opacity-0">
            <DeltaButton disabled={grade >= 10} onClick={() => wrappedOnChange?.(grade + 0.25)}><ChevronUpIcon /></DeltaButton>
        </div>
        <select 
        className="text-4xl text-gray-300  text-center bg-none appearance-none p-0"
        value={grade}
        onChange={(e) => wrappedOnChange?.(parseFloat(e.target.value))}>
            {gradeOptions.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
        <div className="group-hover:opacity-100 opacity-0">
        <DeltaButton disabled={grade <= 0} onClick={() => wrappedOnChange?.(grade - 0.25)}><ChevronDownIcon /></DeltaButton>
        </div>
        </div>

    </div>}
