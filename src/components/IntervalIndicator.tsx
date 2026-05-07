type Props = {
    progress: number,
}
export function IntervalIndicator({progress}:Props){

    return <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ background: `conic-gradient(#fff ${progress * 360}deg, rgb(255 255 255 / 0.35) 0deg)` }}
    />
}
