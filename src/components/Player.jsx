import { CylinderCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three"
import useWindowSize from "../hooks/useWindow";

// isCanvasClicked sent as prop 
export default function Player({canvasIsClicked, camera, canvasRef}) {

    const body = useRef()
    const bodyMesh = useRef()
    const newspaper = useRef()
    const basket = useRef()
    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    const { rapier, world } = useRapier()
    const rapierWorld = world.raw()
    const [ smoothedCameraPositon ] = useState(() => new THREE.Vector3(10, 10, 10))
    const [ smoothedCameraTarget ] = useState(() => new THREE.Vector3())
    const [ aiming, setAiming ] = useState(false)


    // let aiming = false // make both state?
    // let throwing = false 

    let playerPositionArray = []

    const jump = () => {

        const origin = body.current.translation()
        origin.y -= 0.31
        const direction = { x:0, y:-1, z:0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = rapierWorld.castRay(ray, 10, true)
        console.log(hit)
        if (hit.toi < 0.1) {
            body.current.applyImpulse({ x:0, y:0.5, z:0 })
        }
        
    }

    useEffect(() => {
        // subscribekeys notes when they change state from pressed, to not pressed
        const unsubscribeJump = subscribeKeys((state) => {
            return state.jump
        }, (value) => {
            console.log('Jump?', value)
            if(value) {jump()}
        })
        return () => {
            unsubscribeJump()
        }
    }, [])

    useFrame((state, delta) => {
        const { forward, backward, leftward, rightward} = getKeys()

        const impulse = { x:0, y:0, z:0 }
        const torque = { x:0, y:0, z:0 }

        const impulseStrength = 1 * delta
        const torqueStrength = 1 * delta

        if (forward) {
            impulse.z -= impulseStrength
        } 

        if (backward) {
            impulse.z = impulseStrength
        } 
        
        if (leftward) {
            impulse.x -= impulseStrength
        } 

        if (rightward) {
            impulse.x = impulseStrength
        } 


        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)

        /**
         * Camera
         */
        const bodyPosition = body.current.translation()
        const bodyLinerVelocity = body.current.linvel()

        // array of previous and current positions
        // find difference in the vectors
        // below was trial and error to get the newspaper to follow the player 
        // get the difference in the vectors and applyTranslation to the newspaper
        playerPositionArray.push(bodyPosition)
        if (playerPositionArray.length > 2) {
            playerPositionArray.shift()
        }
        let translation = { x: playerPositionArray[1].x - playerPositionArray[0].x, y: playerPositionArray[1].y - playerPositionArray[0].y, z: playerPositionArray[1].z - playerPositionArray[0].z }

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 2.5
        cameraPosition.y += 0.9
        
        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)

        smoothedCameraPositon.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothedCameraPositon)
        state.camera.lookAt(smoothedCameraTarget)

        basket.current.position.copy(bodyPosition)
        basket.current.position.y -= 0.10
        basket.current.position.z += 0.30  

        newspaper.current.setNextKinematicTranslation(bodyLinerVelocity) // does nothing from what I can tell

        // newspaper.current.setLinVel(bodyLinerVelocity)
        // newspaper.current.position.set(bodyPosition)
        // newspaper.current.position.set(bodyPosition.x, bodyPosition.y, bodyPosition.z);
        // newspaper.current.position(bodyPosition ? bodyPosition : [0,0,0])        
        // Notes should this logic be in the animation loop?
        /**
         * Newspaper position
         */
        // console.log(bodyPosition)
        // if (!throwing) {
        //     console.log(body)
        //     if (body.current.translation()) {

        //         const newspaperPos = new THREE.Vector3()
        //         newspaperPos.copy(body.current.translation())
        //         if (newspaperPos) {

        //             newspaper.current.position.copy(newspaperPos)
        //             // // newspaper.current.position.copy(bodyPosition ? bodyPosition : [0,0,0])
        //             // // new
                    // newspaper.current.position.y -= 0.10
        //             newspaper.current.position.z += 0.30            
        //         }
        //     }
        // }
        // console.log("state: ", clientWidth)
        if (aiming && canvasIsClicked) { // aiming
            console.log("canvasIsClicked", canvasIsClicked)
            // impulse direction taken from pointer position in relation to body
            // when canvasIsClicke == False; apply impulse
            // or for now wait 3 secs or so then throw
            // use pointer location => state.pointer
            // how to get x and y of center of body? alternatively for now use centre of screen
            // camera looks at centre in x and y
            // how to get centre of screen?

            // let meshScreenLocation = new THREE.Vector3()
            // meshScreenLocation.copy(bodyMesh.current.parent.position)
            // meshScreenLocation.project(camera) // not sure why error: Uncaught TypeError: Cannot read properties of undefined (reading 'elements')
            // // at Vector3.applyMatrix4 (three.module.js:4498:15)
            // // at Vector3.project
            // console.log(meshScreenLocation)
            // // console.log(bodyMesh.current.parent)
            // // bodyMesh.current.parent.position
            // console.log(camera)
            console.log(bodyMesh.current.parent.position)
            console.log(state.pointer)

            // console.log(canvasRef.current)
            let canvasWidth = canvasRef.current.width
            let canvasHeight = canvasRef.current.height
            // get centre of screen
            let center = new THREE.Vector2()
            
            // console.log(rapierWorld)
            // perhaps change to rigid body now?
            // throws when click released
            
            console.log("aiming")
        }
        // throwing when pointer lifted
        if (aiming && !canvasIsClicked) {
            // Later have html or sprite arrow for aiming direction
            // use pointer location @ release -> -1 to 1
            // TODO: use magnitude of each x and y
            console.log("throwing")
            // first thoughts: yPointer == yImpulse and zImpulse takes yPointer magnitude
            let impulse = { x:-state.pointer.x, y:0.01, z:-state.pointer.y }
            impulse = { x:0, y:0.01, z:-0.01 }
            newspaper.current.applyImpulse(impulse)
            
            setAiming(false)

        }
    })

    function initAim() {
        // Done: have object in place of newspaper - > cube for now
        // TODO: allow for drag of mouse -> distance of drag more force
        // aiming = true
        setAiming(true)
        // on release -> throw newspaper
    }


    return <>
    <RigidBody
        ref={ body }
        // colliders="ball"
        restitution={ 0.2 }
        friction={ 1 } 
        linearDamping={ 0.5 }
        angularDamping={ 0.5 }
        position={ [ 0, 1, 0 ] }
        >
        {/* TODO: allow click and drag to set and aim for throw; release for throw */}
        {/* Later: click area should be near character, allow from not on character later */}
        <mesh
            ref={ bodyMesh } 
            castShadow
            onPointerDown={initAim}
            >
            <boxGeometry args={ [ 0.3, 0.3, 0.3 ] } />
            <meshStandardMaterial flatShading color="mediumpurple" />
        </mesh>
    </RigidBody>
    {/* // if throwing == False; newspaper.position = body.position + offset */}
    {/* have a temp shelf for the newspapers? */}
    <mesh castShadow ref={basket}>
        <boxGeometry args={ [ 1, 0.001, 1 ] } />
        <meshStandardMaterial flatShading color="yellow" />
        </mesh>
    <RigidBody
    ref={newspaper}
    restitution={ 0.2 }
    friction={ 1 } 
    linearDamping={ 0.5 }
    angularDamping={ 0.5 }
    position={[-0.2, 1, 0.2]}
    >
        <mesh castShadow>
        <boxGeometry args={ [ 0.03, 0.1, 0.5 ] } />
        <meshStandardMaterial flatShading color="white" />
        </mesh>
    </RigidBody> 
    </>
}