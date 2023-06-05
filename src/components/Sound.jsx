import { useLoader, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { AudioLoader, AudioListener, AudioAnalyser, Camera } from 'three';

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



export function Sound(){
    const sound = useRef();

    let track = urls.fullTrack
    const urls = {
      fullTrack: 'sound/Throwing sounds.mp3'
  }
  const {camera} = useThree()
  // vanilla code
    const listener = new AudioListener()
    camera.add(listener)
    const audioLoader = new AudioLoader()
  
    const soundEffect = new Audio( listener )
  
    audioLoader.load(urls.fullTrack , function(buffer) {
      console.log("track loaded")
      soundEffect.setBuffer( buffer )
      soundEffect.setLoop( true )
      soundEffect.setVolume( 1 )
      soundEffect.play()
    })

return soundEffect
    // return (
    //     <>
    //         <Audio ref={sound} track={track} />
    //         {/* <Analyzer sound={sound} /> */}
    //     </>
    // )
}