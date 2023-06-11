import { useThree } from '@react-three/fiber';
import useGame from '../stores/useGame';
import * as THREE from "three"

export function Sound(){
    const setThrowEffect = useGame((state) => state.setThrowEffect)
    const setAimEffect = useGame((state) => state.setAimEffect)

    const urls = {
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
        soundEffect.setBuffer( buffer )
        soundEffect.setLoop( false )
        soundEffect.setVolume( volume )
        setSoundEffect(soundEffect)
      })
    }
    
    setupSoundEffect(urls.throw, camera, setThrowEffect, 0.6)
    setupSoundEffect(urls.aim, camera, setAimEffect, 0.3)

}