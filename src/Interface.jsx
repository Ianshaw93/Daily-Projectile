import { useEffect, useRef, useState } from "react"
import useGame from "./stores/useGame"
import { addEffect } from "@react-three/fiber"

export default function Interface() {
    const papersLeft = useGame((state) => {return state.papersLeft}) 
    const startingNumPapers = useGame((state) => {return state.startingNumPapers}) 
    const papersDelivered = useGame((state) => state.papersDelivered) 
    const phase = useGame((state) => state.phase)
    
    const restart = useGame((state) => state.restart)  
    const isAiming = useGame((state) => state.isAiming)

    const arrowRef = useRef();
    const startPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [mousePos, setMousePos] = useState({...startPos});

    let pDelivered = 0
    const deliveredRef = useRef()
    const timeRef1 = useRef()
    const timeRef2 = useRef()
    const distanceRef = useRef()
    const powerBarRef = useRef()
    let release_prompt_text_color;

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
        const handleMouseMove = (event) => {
            setMousePos({ x: event.clientX, y: event.clientY });
          };            
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            unsubscribeEffect()
            window.removeEventListener('mousemove', handleMouseMove);
        }
    } ,[])
    // todo -> tween back to middle on release
    useEffect(() => {
        const arrow = arrowRef.current;
        const powerbar = powerBarRef.current;
        if (arrow) {
          const dx = mousePos.x - startPos.x;
          const dy = mousePos.y - startPos.y;
          const angle = Math.atan2(dy, dx);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const startX = mousePos.x - 15
          const startY = mousePos.y - 15
        //   distance changes color
        // use max dx, or dy
        // should be zero to 1
        const relative_dx = dx / (window.innerWidth / 2)
        const relative_dy = dy / (window.innerHeight / 2)
        const magnitude = Math.max(Math.abs(relative_dx), Math.abs(relative_dy))
        let color = 'black'
        if (magnitude > 0.8) {
            color = 'red'
        } else if (magnitude > 0.65 && magnitude < 0.8) {
            color = 'orange'
        } else if (magnitude > 0.45 && magnitude < 0.65) {
            color = 'yellow'
        } else if (magnitude > 0.3 && magnitude < 0.45) {
            color = 'green'
        } else if (magnitude > 0.15 && magnitude < 0.3) {
            color = 'blue'
        }
          release_prompt_text_color = color
          if (isAiming) {
            if (powerbar) {
                powerbar.style.backgroundColor = color
                powerbar.style.fill = color
                powerbar.style.height = `${magnitude*100}%`
                powerBarRef.current.style.width = '100%'
            }
            arrow.style.display = ''
            arrow.style.fill = color
            arrow.style.color = color
            arrow.style.transform = `
              translate(${startX}px, ${startY}px)
            
            `;
          } else {
            arrow.style.display = 'none'
            arrow.style.fill = 'black'
            arrow.style.transform = `
              translate(${startPos.x}px, ${startPos.y}px)
              rotate(0rad)
              scaleX(1)
            `;
          }
        }
      }, [mousePos, isAiming]);

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
    let svg_dims = 60
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
        <div 
            className="aiming-circle" 
            ref={arrowRef}
            style={{transform: 'translate(-15px, +15px)'}}
        >
            <div className="power-bar-container" style={{transform: 'translate(0px, -40px)'}}>
                <div className="power-bar" ref={powerBarRef}></div>
            </div>
            <div className="aiming-paper" style={{ position: 'absolute', top: '5%', left:'1.8%',zIndex: 1, color: release_prompt_text_color }}>
                {/* have text change colour and be at centre of pointer */}
                release to 🎯
            </div>
        </div>
        <div className="papersLeft">{papers}</div>
        <div className="crossOverlayPapersLeft">{crosses}</div>
    </div>)
}