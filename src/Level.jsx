import * as THREE from 'three'
// import Spinner from './Spinner.jsx'
import { CylinderCollider, Debug, Physics, RigidBody } from '@react-three/rapier'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

// import Player from "./components/Player"


THREE.ColorManagement.legacyMode = false

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' })
const floor2Material = new THREE.MeshStandardMaterial({ color: 'red' })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'blue' })
const wallMaterial = new THREE.MeshStandardMaterial({ color: 'yellow' })


function BlockStart({ position = [ 0, 0, 0 ]}) {
    return <group position={position} >
            <RigidBody type="fixed">
                <mesh geometry={ boxGeometry } material={ floor1Material } position={ [ 0, - 0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
            </RigidBody>
    </group>
}

export function BlockSpinner({ position = [ 0, 0, 0 ]}) {
        const obstacleRef = useRef()
        const [ speed ] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1))
    
        useFrame((state) => {
            const time = state.clock.getElapsedTime()
            const eulerRotation = new THREE.Euler(0, time * speed, 0)
            const quarternionRotation = new THREE.Quaternion().setFromEuler(eulerRotation)
            obstacleRef.current.setNextKinematicRotation(quarternionRotation, true)

        })
    
    return <group position={position} >
        <RigidBody type="fixed">
            <mesh geometry={ boxGeometry } material={floor2Material} position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] } receiveShadow />
        </RigidBody>
        <RigidBody
            type="kinematicPosition"
            ref={obstacleRef}
            position={[0,0.2,0]}
            restitution={0.2}
            friction={0}
        >
            <mesh geometry={boxGeometry} material={obstacleMaterial} scale={ [ 3.5, 0.3, 0.3 ] } castShadow />
        </RigidBody>
    
    </group>
}

export function BlockLimbo({ position = [ 0, 0, 0 ]}) {
    const obstacleRef = useRef()
    const [ timeOffset ] = useState(() => Math.random()*2*Math.PI)

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const y = Math.sin(time + timeOffset) + 1.15
        obstacleRef.current.setNextKinematicTranslation({x: y, y: position[1], z: position[2]})

    })

return <group position={position} >
    <RigidBody type="fixed">
        <mesh geometry={ boxGeometry } material={floor2Material} position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] } receiveShadow />
    </RigidBody>
    <RigidBody
        type="kinematicPosition"
        ref={obstacleRef}
        position={[0,0.2,0]}
        restitution={0.2}
        friction={0}
    >
        <mesh geometry={boxGeometry} material={obstacleMaterial} scale={ [ 3.5, 0.3, 0.3 ] } castShadow />
    </RigidBody>

</group>
}

export function BlockAxe({ position = [ 0, 0, 0 ]}) {
const obstacleRef = useRef()
const [ timeOffset ] = useState(() => Math.random()*2*Math.PI)

useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const y = Math.sin(time + timeOffset) + 1.15
    obstacleRef.current.setNextKinematicTranslation({x: position[0], y: y, z: position[2]})

})

return <group position={position} >
<RigidBody type="fixed">
    <mesh geometry={ boxGeometry } material={floor2Material} position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] } receiveShadow />
</RigidBody>
<RigidBody
    type="kinematicPosition"
    ref={obstacleRef}
    position={[0,0.2,0]}
    restitution={0.2}
    friction={0}
>
    <mesh geometry={boxGeometry} material={obstacleMaterial} scale={ [ 3.5, 0.3, 0.3 ] } castShadow />
</RigidBody>

</group>
}

export function BlockEnd({ position = [ 0, 0, 0 ]}) {
const hamburgerGltf = useGLTF("./hamburger.glb");

hamburgerGltf.scene.children.forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
})
return <group position={position} >
            <Physics>
                <Debug />
                <RigidBody type='fixed'>

                    <mesh geometry={ boxGeometry } material={floor1Material} position={ [0, 0, 0] } scale={ [ 4, 0.2, 4 ] } receiveShadow />
                </RigidBody>
                <RigidBody colliders={false} position={[0, 0.25, 0]}>
                    <primitive object={hamburgerGltf.scene} scale={0.25} />
                    <CylinderCollider args={[ 0.5, 1.25 ]}/>
                </RigidBody>   
            </Physics>
        </group>
}

export function Level({ count = 5, types = [ BlockSpinner, BlockLimbo, BlockAxe ] }) {

    const blocks = useMemo(() => {
        const blocks = []

        for(let i = 0; i < count; i++) {
            const type = types[ Math.floor(Math.random() * types.length) ]
            blocks.push(type)
        }
        return blocks
    }, [ count, types ])
    console.log(blocks)

    return(

    <>
        
            <BlockStart position={[0, 0, 0]}/>
            { blocks.map((Block, index) => 
                <Block key={index} position={[0, 0, -(index+1)*4]}/>
                )}
            <BlockEnd position={[0, 0, -(blocks.length+1)*4]}/>

    </>
    )
}