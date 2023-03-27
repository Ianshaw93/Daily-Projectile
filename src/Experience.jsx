import { Physics, Debug } from '@react-three/rapier'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './components/Player'

// click events on canvas as props; send to player
export default function Experience({canvasIsClicked, camera, canvasRef})
{
    console.log(canvasRef.current) // attempt to access canvas properties
    return <>


        <Physics>
            {/* <Debug /> */}
            <Lights />
            <Level />
            <Player canvasIsClicked={canvasIsClicked} camera={camera} canvasRef={canvasRef}/>
        </Physics>



    </>
}