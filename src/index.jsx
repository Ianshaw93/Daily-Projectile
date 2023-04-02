import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import { KeyboardControls } from '@react-three/drei'
import { useRef, useState } from 'react'

function CanvasComponent(props) {
    const canvasRef = useRef()
    const [canvasIsClicked, setCanvasIsClicked] = useState(false)
    const [ pointerPosition, setPointerPosition ] = useState(null)
    const handlePointerDown = () => {
        setCanvasIsClicked(true)
    } 
    const handlePointerUp = () => {
        setCanvasIsClicked(false)
    }

    return (
        <Canvas onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} {...props} ref={canvasRef}>
          <Experience pointerPosition={pointerPosition} canvasIsClicked={canvasIsClicked} camera={props.camera} canvasRef={canvasRef}/>
        </Canvas>
      );
}


const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
    <KeyboardControls
        map={ [
            { name: 'forward', keys: [ 'ArrowUp', 'KeyW'] },
            { name: 'backward', keys: [ 'ArrowDown', 'KeyS'] },
            { name: 'leftward', keys: [ 'ArrowLeft', 'KeyA'] },
            { name: 'rightward', keys: [ 'ArrowRight', 'KeyD'] },
            { name: 'jump', keys: [ 'Space'] }
        ] }
    >

        <CanvasComponent
            shadows
            camera={ {
                fov: 45,
                near: 0.1,
                far: 200,
                position: [ 2.5, 4, 6 ]
            } }
            />
    </KeyboardControls>
)