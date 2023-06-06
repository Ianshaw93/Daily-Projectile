import { Physics, Debug } from '@react-three/rapier'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './components/Player'
import Demo from './Demo.jsx'
import { Sound } from './components/Sound.jsx'
import { Suspense } from 'react'
// import { Audio, AudioListener, AudioLoader } from 'three'
// import { useThree } from '@react-three/fiber'

// click events on canvas as props; send to player
export default function Experience({canvasIsClicked, canvasRef})
{
    // const urls = {
    //     fullTrack: 'sound/Throwing sounds.mp3'
    // }
    // const {camera} = useThree()
    // // vanilla code
    //   const listener = new AudioListener()
    //   camera.add(listener)
    //   const audioLoader = new AudioLoader()
    
    //   const soundEffect = new Audio( listener )
    
    //   audioLoader.load(urls.fullTrack , function(buffer) {
    //     console.log("track loaded")
    //     soundEffect.setBuffer( buffer )
    //     soundEffect.setLoop( true )
    //     soundEffect.setVolume( 1 )
    //     // soundEffect.play()
    //   })

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
            <Suspense>

                <Sound />
            </Suspense>
        </Physics>



    </>
}