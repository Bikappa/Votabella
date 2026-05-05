import { useEffect, useRef, useState } from "react"

type Props = {
    period: number,
}
export function IntervalIndicator({period}:Props){

    const [left, setLeft] = useState(period);
    const iid = useRef(0);

    useEffect(() => {

        if(iid.current !== 0){
            return
        }
        iid.current = setInterval(
            () => {setLeft((prev) => {
                if(prev - 100 <= 0){
                    clearInterval(iid.current)
                    return 0;
                }
                return prev - 50
            })}, 50)

        return () => {
            clearInterval(iid.current)
            iid.current = 0
        }
        
    })

    return <div
    className="bg-gray-300 h-1.5 rounded"
    style={{ width: `${Math.round(100-(left / period) * 100)}%` }}
  />
}