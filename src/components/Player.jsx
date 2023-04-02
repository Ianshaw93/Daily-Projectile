import { CuboidCollider, CylinderCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three"

// isCanvasClicked sent as prop 
export default function Player({canvasIsClicked, camera, canvasRef}) {

    const playerRef = useRef()
    const bodyMesh = useRef()
    const throwingNewspaper = useRef()
    const newspaper = useRef()
    const basketRef = useRef()
    const unusedPapersGroupRef = useRef()
    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    const { rapier, world } = useRapier()
    const rapierWorld = world.raw()
    const [ smoothedCameraPositon ] = useState(() => new THREE.Vector3(10, 10, 10))
    const [ smoothedCameraTarget ] = useState(() => new THREE.Vector3())
    const [ aiming, setAiming ] = useState(false)
    const [ pointLocation, setPointLocation ] = useState(null)
    const [ thrown, setThrown ] = useState(false)
    const [ paperQuantity, setPaperQuantity ] = useState(6)


    // let aiming = false // make both state?
    // let throwing = false 

    let playerPositionArray = []

    const jump = () => {

        const origin = playerRef.current.translation()
        origin.y -= 0.31
        const direction = { x:0, y:-1, z:0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = rapierWorld.castRay(ray, 10, true)
        console.log(hit)
        if (hit.toi < 0.1) {
            playerRef.current.applyImpulse({ x:0, y:0.05, z:0 })
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


        playerRef.current.applyImpulse(impulse)
        playerRef.current.applyTorqueImpulse(torque)

        /**
         * Camera
         */
        const playerPosition = playerRef.current.translation()
        const playerLinerVelocity = playerRef.current.linvel()

        // array of previous and current positions
        // find difference in the vectors
        // below was trial and error to get the newspaper to follow the player 
        // get the difference in the vectors and applyTranslation to the newspaper
        // translation can be applied to kinematic rigidbody

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(playerPosition)
        cameraPosition.z += 2.5
        cameraPosition.y += 0.9
        
        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(playerPosition)

        smoothedCameraPositon.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothedCameraPositon)
        state.camera.lookAt(smoothedCameraTarget)

        // basket trial at alternative to moving newspaper location - have it sit in a basket that moves with player
        basketRef.current.position.copy(playerPosition)
        basketRef.current.position.y -= 0.10
        basketRef.current.position.z += 0.30 
        
        // move unused papers in relation to basket
        unusedPapersGroupRef.current.position.copy(basketRef.current.position)

        // throwingNewspaper.current.setNextKinematicTranslation(translation) // does nothing from what I can tell
        if (!aiming && !thrown) {
            // TODO: maintain non rigid body until throwing

            newspaper.current.position.copy(playerPosition)
            newspaper.current.position.x -= -0.2
            newspaper.current.position.z += 0.4  
        }

        if (aiming && canvasIsClicked) { // aiming
            console.log("canvasIsClicked", canvasIsClicked)
            // Later have html or sprite arrow for aiming direction
            // Aim: to have newspaper move back to pointer position, like loading for a throw
            // impulse direction taken from pointer position in relation to body
            // when canvasIsClicke == False; apply impulse
            // camera looks at centre in x and y

            console.log("state: ",state)

            // console.log(canvasRef.current)
            let canvasWidth = canvasRef.current.width
            let canvasHeight = canvasRef.current.height
            // get centre of screen
            let center = new THREE.Vector2()

            if(throwingNewspaper.current){
                // change z to behind object
                // need to convert pointer position to 3d space
                throwingNewspaper.current.setTranslation({x: state.pointer.x, y: state.pointer.y+0.1, z: playerPosition.z + 0.2})
            }

            console.log("aiming")
        }
        // throwing when pointer lifted
        if (aiming && !canvasIsClicked) {
            // use pointer location @ release -> -1 to 1
            // TODO: use magnitude of each x and y
            // setThrowing(true)
            console.log("throwing")
            console.log(state.pointer)
            // first thoughts: yPointer == yImpulse and zImpulse takes yPointer magnitude
            let impulse = { x:-state.pointer.x/100, y:0.1, z:state.pointer.y/100 }
            throwingNewspaper.current.applyImpulse(impulse)
            // does below re-render mean reset of moving positions? - save current positions?
            setThrown(true)
            setAiming(false)
            setPaperQuantity((current) => current - 1)

        }
    })

    function initAim(event) {
        console.log("event: ",event)
        // Done: have object in place of newspaper - > cube for now
        // TODO: allow for drag of mouse -> distance of drag more force
        setPointLocation(event.point)
        setAiming(true)
        // on release -> throw newspaper
    }

    const newspaperShell = (
    <>
        <boxGeometry args={ [ 0.03, 0.1, 0.5 ] } />
        <meshStandardMaterial flatShading color="white" />        
    </>
    )

    // const paperQuantity = 6 // later send in via props - may need state if 1 subtracted each time removed from pile?

    const unusedPapers = []
    for (let i = 0; i < paperQuantity; i++){
        (
        // move group locations
        // how to call ref on each one?
        // how to have random placesment in basket?
           unusedPapers.push( 
                <mesh castShadow position={[i/5 - 0.5, 0, 0.01]}>
                    {newspaperShell}
                </mesh>
            )        
        )}
        // on selection of first newspaper and throw of subsequent -> one unused newspaper removed from pile 
    return <>
    {/* TODO: player body should not collide with newspaper being thrown */}
    <RigidBody
        ref={ playerRef }
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
     {/*
        create group for newspaper pile in basket
     */}
        <group ref={unusedPapersGroupRef}>
            {unusedPapers}
        </group>
    {/* // if throwing == False; newspaper.position = body.position + offset */}
    {/* have a temp shelf for the newspapers? 
    probably have newspaper pile located in relation to basket */}
    <mesh castShadow ref={basketRef}>
        <boxGeometry args={ [ 1, 0.001, 1 ] } />
        <meshStandardMaterial flatShading color="yellow" />
    </mesh>
    {/* 
        future group nonRigidbodies (piles of non thrown newspapers) -> next in line becomes rigidbody
        perhaps have rigidbody change back to non once at rest after throw
    */}
{(aiming || thrown)?<RigidBody
    ref={throwingNewspaper}
    restitution={ 0.2 }
    friction={ 1 } 
    linearDamping={ 0.5 }
    angularDamping={ 0.5 }
    // change z below to behind player position
    // later to be previous paper position
    position={[ pointLocation.x, pointLocation.y, pointLocation.z ]}
    >
        <mesh castShadow>
            {newspaperShell}
        </mesh>
    </RigidBody>: 
    // non rigidbody -> should be part of pile
            <mesh castShadow
            ref={newspaper} // ref with i?
            >
                {newspaperShell}
            </mesh>
    }
    </>
}