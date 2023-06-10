import { useThree } from '@react-three/fiber';
import useGame from '../stores/useGame';
import * as THREE from "three"

export function Sound(){
    const setThrowEffect = useGame((state) => state.setThrowEffect)
    const setAimEffect = useGame((state) => state.setAimEffect)

  // zustand soundEffect -> to be actioned elsewhere
    // const sound = useRef();

    // let track = urls.fullTrack
    const urls = {
      // fullTrack: 'sound/Throwing sounds.mp3',
      aim: 'sound/aim.mp3',
      throw: 'sound/throw.mp3'

  }
  const {camera} = useThree()
  // vanilla code
    function setupSoundEffect(track, camera, setSoundEffect, volume) {

      const listener = new THREE.AudioListener()
      camera.add(listener)
      const audioLoader = new THREE.AudioLoader()
    
      const soundEffect = new THREE.Audio( listener )
    
      audioLoader.load(track , function(buffer) {
        console.log("track loaded")
        soundEffect.setBuffer( buffer )
        soundEffect.setLoop( false )
        soundEffect.setVolume( volume )
        // soundEffect.play()
        setSoundEffect(soundEffect)
      })
    }
    
    setupSoundEffect(urls.throw, camera, setThrowEffect, 0.6)
    setupSoundEffect(urls.aim, camera, setAimEffect, 0.3)

}