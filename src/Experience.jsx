import { Physics, Debug } from '@react-three/rapier'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './components/Player'

export default function Experience()
{
    return <>


        <Physics>
            {/* <Debug /> */}
            <Lights />
            <Level />
            <Player />
        </Physics>



    </>
}