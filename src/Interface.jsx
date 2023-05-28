import { useEffect, useRef } from "react"
import useGame from "./stores/useGame"
import { addEffect } from "@react-three/fiber"

export default function Interface() {
    const papersLeft = useGame((state) => {return state.papersLeft}) 
    const startingNumPapers = useGame((state) => {return state.startingNumPapers}) 
    const papersDelivered = useGame((state) => state.papersDelivered) 
    const phase = useGame((state) => state.phase)
    const restart = useGame((state) => state.restart)
    const minDistance = useGame((state) => state.minDistance)
    
    let pDelivered = 0
    const deliveredRef = useRef()
    const timeRef1 = useRef()
    const timeRef2 = useRef()
    const distanceRef = useRef()
    console.log("papersLeft, papersDelivered: ", papersLeft, papersDelivered)

    // bug still occurs without this useEffect
    useEffect(() => {
        const unsubscribeEffect = addEffect(() => {
            const state = useGame.getState()

            let elapsedTime = 0
            if (state.phase === 'playing') {
                elapsedTime = Date.now() - state.startTime
            }
            else if (state.phase === 'ended') {
                elapsedTime = state.endTime - state.startTime
            }
            elapsedTime /= 1000
            elapsedTime = elapsedTime.toFixed(2)

            if (timeRef1.current) {
                timeRef1.current.textContent = "⏱️" + elapsedTime
            }
            if (timeRef2.current) {
                timeRef2.current.textContent = "⏱️" + elapsedTime
            }
            if (distanceRef.current) {
                distanceRef.current.textContent = "📏" + (state.minDistance ? state.minDistance + "m" : "-.--m")
            }
            /**
             * bug delivered resetting from zero back to previous total
             * for mvp reset location only not papers thrown allow refresh restart
             */
            pDelivered = state.papersDelivered

        })

        return () => {
            // unsubscribeEffect()
        }
    } ,[])

    let papersThrown = startingNumPapers - papersLeft
    // cross emojis
    let crosses = ''
    for (let i = 0; i < papersThrown; i ++ ) {
        crosses += '❌'
    }

    let papers = ''
    for (let i = 0; i < startingNumPapers; i ++ ) {
        papers += '🗞️'
    }

    let isTimed = false; // only applies to levels, not range
    let isDistanceMeasured = true;
    /**
     * issue -> this component is outside of React
     * TODO: have different screen for end of level
     * 
     */
    console.log("delivered", papersDelivered)
    return (<div className="interface">

        { isTimed ? <div ref={timeRef1} className="time"></div> : null }
        { isDistanceMeasured ? <div ref={distanceRef} className="time"></div> : none }

        <div className="papersDelivered">📰 <span ref={deliveredRef}>{papersDelivered}</span>/ {startingNumPapers} </div>

        { phase === 'ended' && (<>
        <div className="endScreen">
        <div className="row">📰 <span ref={deliveredRef}>{pDelivered}</span>/ {startingNumPapers}</div>
        <div ref={timeRef2} className="row"></div>
        <div className="row" onClick={ restart }>Restart</div>
        </div>
        </>
        
        ) }

        <div className="papersLeft">{papers}</div>
        <div className="crossOverlayPapersLeft">{crosses}</div>
    </div>)
}