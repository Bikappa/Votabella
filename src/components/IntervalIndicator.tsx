type Props = {
    period: number,
    left: number,
}
export function IntervalIndicator({period, left}:Props){
    const progress = Math.max(0.01, Math.min(1, 1 - left / period))

    return <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ background: `conic-gradient(#fff ${progress * 360}deg, rgb(255 255 255 / 0.35) 0deg)` }}
    />
}
