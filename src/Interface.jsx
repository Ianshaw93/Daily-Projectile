import { useEffect, useRef, useState } from "react"
import useGame from "./stores/useGame"
import { addEffect, useThree } from "@react-three/fiber"

export default function Interface() {
    const papersLeft = useGame((state) => {return state.papersLeft}) 
    const startingNumPapers = useGame((state) => {return state.startingNumPapers}) 
    const papersDelivered = useGame((state) => state.papersDelivered) 
    const phase = useGame((state) => state.phase)
    const restart = useGame((state) => state.restart)
    const isAiming = useGame((state) => state.isAiming)
    const playerScreenLocation = useGame((state) => state.playerScreenLocation)
    
    let pDelivered = 0
    const deliveredRef = useRef()
    const timeRef1 = useRef()
    const timeRef2 = useRef()
    console.log("papersLeft, papersDelivered: ", papersLeft, papersDelivered)
    // arrow logic below
    const arrowRef = useRef()
    // // startPos should be centre of playerModel
    // const { viewport } = useThree();
    // const { width, height } = viewport();
    // const startPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // const startPos = {
    //     x: (playerScreenLocation.x + 1) * window.innerWidth / 2, 
    //     y: (-playerScreenLocation.y + 1) * window.innerHeight / 2
    // } // converted to screen
    const startPos = playerScreenLocation
    console.log("screenCentre: ", startPos, playerScreenLocation)

    const [isMouseDown, setIsMouseDown] = useState(false);
    const [mousePos, setMousePos] = useState({...startPos});

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
        // later needs aiming & canvas clicked
        const handleMouseMove = (event) => {
            setMousePos({x: event.clientX, y: event.clientY})
        }
        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            unsubscribeEffect()
            window.removeEventListener('mousemove', handleMouseMove)
        }
    } ,[])
    /**
     * logic for html arrow sizing
     * later move to own component
     * try with circle that changes color 
     */

    useEffect(() => {
        console.log("mouse moved", mousePos, startPos)
        const arrow = arrowRef.current;
        if (arrow) {
          const dx = mousePos.x - startPos.x;
          const dy = mousePos.y - startPos.y;
          const angle = Math.atan2(dy, dx) - 1.5708; // 1.5708rad = 90 degs
          const dist = Math.sqrt(dx * dx + dy * dy);
    
          if (isAiming) {
            arrow.style.transform = `
              translate(${startPos.x}px, ${startPos.y}px)
              rotate(${angle}rad)
              scaleX(${dist / 100})
              scaleY(${dist / 100})
            `;
          } else {
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
        <div className="aiming-circle">
            <svg height="30" width="30">
                <circle cx="15" cy="15" r="12" stroke-width="0"></circle>
            </svg>        
        </div>
        <div className="arrow" >
            <img
                ref={arrowRef}
                src = "black-arrow.png"
                style={{
                    transform: `translate(50%, 50%) rotate(90)`,
                    height: `100px`,
                    width: `100px)`,
                    transformOrigin: `top-center`,
                    scale: '1',
                    display: isAiming ? "" : "none"
                  }}
            />
        </div>

        <div className="papersLeft">{papers}</div>
        <div className="crossOverlayPapersLeft">{crosses}</div>
    </div>)
}