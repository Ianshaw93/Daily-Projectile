import { useLoader, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { AudioLoader, AudioListener, AudioAnalyser, Camera } from 'three';
import useGame from '../stores/useGame';

const urls = {
    fullTrack: '/sound/Throwing sounds.mp3'
}

// const Audio = forwardRef(({ track, ...props }, ref) => {
//     const { camera } = useThree();
//     const [listener] = useState(() => new AudioListener());
//     const [soundInit, setSoundInit] = useState(false)
  
//     // const setLoaded = useMusicStore((state) => state.setLoaded);
//     // const init = useMusicStore((state) => state.init);
  
//     const buffer = useLoader(AudioLoader, urls[track], null, (xhr) => {
//       if (xhr.loaded === xhr.total) {
//         // setLoaded(track, true);
//         setSoundInit(true)
//         console.log("track loaded")
//       }
//     });
  
//     useEffect(() => {
//       const sound = ref.current;
//       if (sound && soundInit) {
//         sound.setBuffer(buffer);
//         sound.setLoop(true); // true to test
//         sound.setVolume(0.4);
//         sound.play();
//       }
  
//       return () => {
//         // if (sound && soundInit) {
//         //   sound.stop();
//         //   sound.disconnect();
//         // }
//       };
//     }, [buffer, listener, soundInit]);
  
//     return <audio ref={ref} args={[listener]} {...props} />;
//   });

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

// return soundEffect
    // return (
    //     <>
    //         <Audio ref={sound} track={track} />
    //         {/* <Analyzer sound={sound} /> */}
    //     </>
    // )
}