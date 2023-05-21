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
    console.log("papersLeft, papersDelivered: ", papersLeft, papersDelivered)

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
          console.log("dist: ", magnitude)
          if (isAiming) {
            arrow.style.display = ''
            arrow.style.fill = color
            arrow.style.transform = `
              translate(${startX}px, ${startY}px)
            
            `;
          } else {
            arrow.style.display = ''
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
    /**
     * issue -> this component is outside of React
     * TODO: have different screen for end of level
     * 
     */
    console.log("delivered", papersDelivered)
    return (<div className="interface">
        <div ref={timeRef1} className="time"></div>
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
            class="aiming-circle" 
            ref={arrowRef}
            style={{transform: 'translate(-15px, +15px)'}}
        >
        {/* <svg xmlns="http://www.w3.org/2000/svg" width="11" height="20" id="arrow-head">
            <path fill-rule="evenodd" d="M.366 19.708c.405.39 1.06.39 1.464 0l8.563-8.264a1.95 1.95 0 0 0 0-2.827L1.768.292A1.063 1.063 0 0 0 .314.282a.976.976 0 0 0-.011 1.425l7.894 7.617a.975.975 0 0 1 0 1.414L.366 18.295a.974.974 0 0 0 0 1.413"></path>
        </svg> */}
            <div class="aiming-paper" style={{ position: 'absolute', top: '5%', left:'0.5%',zIndex: 1 }}>
                🗞️
            </div>
            <svg height="30" width="30">
                <circle cx="15" cy="15" r="12" stroke-width="0"></circle>
            </svg>
        </div>
        <div className="papersLeft">{papers}</div>
        <div className="crossOverlayPapersLeft">{crosses}</div>
    </div>)
}