import { Physics, Debug } from '@react-three/rapier'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './components/Player'
import { useState } from 'react'
import { useControls } from 'leva'

// click events on canvas as props; send to player
export default function Experience({canvasIsClicked, canvasRef})
{
    // aim show all paper positions; thrown or not on screen
    //  also show index of current thrown paper
    const controls = useControls({

    })
    const [ thrownPaperLocations, setThrownPaperLocations ] = useState([])
    const [ houseLocations, setHouseLocations ] = useState([])

    function handlePaperLocationChange(position) {
        setThrownPaperLocations(prev =>  [...prev ,position]);
    }


    

    return <>

{/* TODO: 1)send thrown newspaper locations from Player component
        2) if within one of the house tiles -> change score
*/}
        <Physics>
            {/* <Debug /> */}
            <Lights />
            {/* TODO: send house tile locations */}
            <Level 
                count = {5}
                houseLocations={houseLocations}
            />
            <Player 
                canvasIsClicked={canvasIsClicked} 
                canvasRef={canvasRef}
                onPaperLocationChange={handlePaperLocationChange}
            />
        </Physics>



    </>
}