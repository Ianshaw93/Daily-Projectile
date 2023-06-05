import { Physics, Debug } from '@react-three/rapier'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './components/Player'
import Demo from './Demo.jsx'

// click events on canvas as props; send to player
export default function Experience({canvasIsClicked, canvasRef})
{


    return <>
        <Physics>
            {/* <Debug /> */}
            <Lights />
            {/* <Level 
                count = {5}
            /> */}
            <Demo />
            <Player 
                canvasIsClicked={canvasIsClicked} 
                canvasRef={canvasRef}
            />
        </Physics>



    </>
}