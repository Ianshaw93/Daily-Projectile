
/** 
 * TODO: have a base for shared items in levels
 * design for throwing range level
 * goal: target from cylinders bull's eye raised above
 * perhaps tree with cat
 */
import * as THREE from 'three'

import { RigidBody } from "@react-three/rapier";
import { House } from './components/House';
import useGame from './stores/useGame';
import SkyComponent from './components/Sky';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' })


function BlockStart({ position = [ 0, 0, 0 ]}) {
    const startRef = useRef()
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const y = Math.sin(time) 
        const z = Math.cos(time) 
        // const z = 0
        // const y = 0
        startRef.current.setNextKinematicTranslation({x: y, y: position[1], z: z})                
    })
    return <group position={position} >
            <RigidBody type="kinematicPosition" ref={startRef}>
                <mesh geometry={ boxGeometry } material={ floor1Material } position={ [ 0, - 0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
            </RigidBody>
    </group>
}

export function ScoreTarget({position = [0, 0, - 15], maxDelta = [10, 0, 10]}) {
    const setTargetLocations = useGame((state) => {return state.setTargetLocations})
    const targetRef = useRef()
    setTargetLocations([{"centre": position, "maxDelta": maxDelta}])
    // useFrame((state) => {
    //     const time = state.clock.getElapsedTime()
    //     const y = Math.sin(time) + 5
    //     const z = Math.cos(time) - 15
    //     targetRef.current.setNextKinematicTranslation({x: y, y: position[1], z: z})                
    //     setTargetLocations([{"centre": [y ,position[1], z], "maxDelta": maxDelta}])
    // })
    // set maxDelta and centre to useGame
    return <group>
        <RigidBody
            position={position}
            type="kinematicPosition"
            ref={targetRef}
            >
            <mesh>
                <cylinderGeometry args={ [ maxDelta[0], maxDelta[2], 0.4, 100 ] } />
                <meshStandardMaterial flatShading color="yellow" />
            </mesh> 
            <House position={[0, 0.01, 0]} scale={0.1}/>   
        </RigidBody>       
    </group>
}

export default function Demo() {
    /**
     * for demo
     * limited player movement -> or reset when falls off platform
     * throw at target area
     * change scoreTarget position with time
     */

    return <>
    <SkyComponent />
    <BlockStart />
    <ScoreTarget />
    </>
} 