import React, { useEffect, useRef, useState } from 'react'
import { RulesObj } from '../Types'

type Props = {
    idRoom: string | number
    socketRef: React.MutableRefObject<any>
    setDisplayEndTurn: React.Dispatch<boolean>
}

const Chrono: React.FC<Props>  = ({ idRoom, socketRef, setDisplayEndTurn }) => {

    const [time, setTime] = useState<number>(1)

    useEffect(() => {        
        socketRef.current.emit("ask rules", idRoom)

        socketRef.current.on("rules", (rulesData: RulesObj) => {
            setTime(rulesData.time)

            setTimeout(() => {
                clearInterval(interval)
            }, rulesData.time*1000)
        })

        let interval = setInterval(() => {
            setTime(time => time - 1)        
        }, 1000)
    }, [])

    return (
        <div>
            { time < 1
                ? setDisplayEndTurn(true)

                :''
            }
            Time: {time}
        </div>
    )
}

export default Chrono
