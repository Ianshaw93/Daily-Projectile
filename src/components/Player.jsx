import { CuboidCollider, CylinderCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls, Html } from "@react-three/drei";
import { useEffect, useRef, useState, createRef } from "react";
import * as THREE from "three"
import useGame from "../stores/useGame";
// import { Paperguy } from "./Paperguy";
import { BoyThrowing } from "./BoyThrowing";


// isCanvasClicked sent as prop 
export default function Player({canvasIsClicked}) {
    
    // Zustand states and functions
    const papersLeft = useGame((state) => {return state.papersLeft})
    const thrownPaperLocations = useGame((state) => {return state.thrownPaperLocations}) // probably not needed in this component
    const subtractPaperLeft = useGame((state) => state.subtractPaperLeft)
    const addPaperLocation = useGame((state) => state.addPaperLocation)
    const start = useGame((state) => state.start)
    const restart = useGame((state) => state.restart)
    const end = useGame((state) => state.end)
    const resetPapers = useGame((state) => state.resetPapers)
    const setIsAiming = useGame((state) => state.setIsAiming)
    const aimSound = useGame((state) => state.aimSound)// 
    const throwSound = useGame((state) => state.throwSound)// 


    const actionsObject = {
        "throw": "throw.001",
        "aim": "aim.001",
        "rest": "rest"
    }

    const [currentAction, setCurrentAction] = useState(actionsObject.rest)
    // playerModel.scene.children.forEach((mesh) =>
    // {
    //     mesh.castShadow = true
    // })

    let startingNumPapers = 6
    /**
     * ref array created for all papers users can throw
     * Bug: position triggered when < -3 y but paper yet to be thrown
     * perhaps add to thrown state array -> check that current has been thrown
     */
    const paperRefs = useRef(Array.from({length: startingNumPapers}, () => createRef()))
    // const [ currentThrowingPaper, setCurrentThrowingPaper ] = useState(0)
    const currentThrowingPaper = useGame((state) => state.currentThrowingPaper)

    const playerRef = useRef()
    const modelRef = useRef()
    const handRef = useRef()
    
    let throwingNewspaper = paperRefs.current[currentThrowingPaper]
    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    const { rapier, world, step } = useRapier()
    const rapierWorld = world.raw()
    const [ smoothedCameraPositon ] = useState(() => new THREE.Vector3(10, 10, 10))
    const [ smoothedCameraTarget ] = useState(() => new THREE.Vector3())
    const [ aiming, setAiming ] = useState(false)
    const [ pointLocation, setPointLocation ] = useState(0)
    const [ thrown, setThrown ] = useState(false)
    const thrownIndexArray = useGame((state) => state.thrownIndexArray)
    const addThrownPaperIndex = useGame((state) => state.addThrownPaperIndex)
    // const [thrownIndexArray, setThrownIndexArray] = useState([]) // needs to be reset -> use in state
    
    const jump = () => {

        const origin = playerRef.current.translation()
        // origin.y -= 0.31 // dimension of object
        origin.y -= 0.247

        const direction = { x:0, y:-1, z:0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = rapierWorld.castRay(ray, 10, true)
        console.log("hit: ", hit, origin, ray)
        // if (hit.toi < 0.1) {
        if (hit.toi == 0) {
            playerRef.current.applyImpulse({ x:0, y:0.025, z:0 })
            // playerRef.current.applyImpulse({ x:0, y:0.25, z:0 })
        }
        
    }

    const reset = () => {
        // need to reset scores also 
        restartPlayer() 
        resetPapers()  
    }
    
    const restartPlayer = () => {
        playerRef.current.setTranslation({ x: 0, y: 1, z: 0 })
        playerRef.current.setLinvel({ x: 0, y: 0, z: 0 })
        playerRef.current.setAngvel({ x: 0, y: 0, z: 0 }) 

    }

    // const resetPapers = () => {
    //     // recreate array?
    //     // reset throwing paper to index zero
    //     // reset score
    // }

    // TODO: how to have an eventlistener for mouse down here?
    useEffect(() => {
        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) =>
            {
                if(value === 'ready')
                    reset()
            }
        )
        // subscribekeys notes when they change state from pressed, to not pressed
        const unsubscribeJump = subscribeKeys((state) => {
            return state.jump
        }, (value) => {
            if(value) {jump()}
        })
      
        const unsubscribeKeys = subscribeKeys((state) => {
            start()
            // or mouse
        })
        return () => {
            unsubscribeReset()
            unsubscribeJump()
            unsubscribeKeys()
        }
    }, [])

    useFrame((state, delta) => {


        const { forward, backward, leftward, rightward} = getKeys()

        const impulse = { x:0, y:0, z:0 }
        const torque = { x:0, y:0, z:0 }

        const impulseStrength = 0.5 * delta
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

        // array of previous and current positions
        // find difference in the vectors
        // below was trial and error to get the newspaper to follow the player 
        // get the difference in the vectors and applyTranslation to the newspaper
        // translation can be applied to kinematic rigidbody

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(playerPosition)
        // y position constant (height above player) // was 0.9
        cameraPosition.y += 1.2
        let defaultZCamDiff = 2 // should change to roughly arm length
        if (!aiming) {
        cameraPosition.z += defaultZCamDiff
    
    }
        else {
            
            // get difference between player centre and position
            cameraPosition.x += state.pointer.x
            cameraPosition.z += Math.sqrt(Math.pow(defaultZCamDiff, 2) - Math.pow(state.pointer.x, 2))
            // if aiming true -> go on circular arc

        }
        const cameraTarget = new THREE.Vector3()
        // // when paper in the air, camera follows until y <= 0.1m
        // if (thrown && !aiming && thrownIndexArray.length && Math.abs(paperRefs.current[thrownIndexArray[thrownIndexArray.length-1]].current.linvel().y) > 0.1) {
        //     cameraTarget.copy(paperRefs.current[thrownIndexArray[thrownIndexArray.length-1]].current.translation())
        // } else { // when paper not in the air follow player
            cameraTarget.copy({x: playerPosition.x, y: playerPosition.y + 0.9, z: playerPosition.z}) //playerPosition.y + 0.75
            // cameraTarget.copy(playerPosition)
        // }

        smoothedCameraPositon.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothedCameraPositon)
        state.camera.lookAt(smoothedCameraTarget)
        /**
         * Phases
         */
        if (playerPosition.z < - (5* 4 + 2)) { 
            end()
        }
        // Later respawn if y < -3
        if (playerPosition.y < - 3) {
            restart()
        }
        if(!aiming) {
            const eulerRotation = new THREE.Euler(0, 0, 0)
            const quarternionRotation = new THREE.Quaternion().setFromEuler(eulerRotation)
            playerRef.current.setRotation(quarternionRotation, true)            
        }
        // if()
        if (aiming && canvasIsClicked) { // aiming
            /**
             * moves paper before throw is actioned on mouse up
            */
               
                if (throwingNewspaper.current) {
                    
                    if(!thrown && throwingNewspaper.current){
                        // attempt -> paper always above body and transaparent paper with hand??
                        // bug fixed: 2nd paper onwards throwing downwards
                        // setLinVel == 0 to overcome velocity from free falling pre throw
                        throwingNewspaper.current.setLinvel({x: 0, y: 0, z: 0})
                        throwingNewspaper.current.setAngvel({ x: 0, y: 0, z: 0 }) 
                        // change to follow pointer x and y -> like impulse?
                        // change in arc like with arrow?
                        // change x and z only
                        // find max difference in screen at aiming area
                        throwingNewspaper.current.setTranslation({x: playerPosition.x + state.mouse.x, y: playerPosition.y + 0.6, z: playerPosition.z - state.mouse.y + 0.2})
                        handRef.current.position.set(playerPosition.x + state.mouse.x, playerPosition.y + 0.6, playerPosition.z - state.mouse.y + 0.2)
                        
                    } else { // not sure why this is needed?
                        throwingNewspaper.current.setTranslation({x: playerPosition.x, y: playerPosition.y+ 0.6, z: playerPosition.z + 0.2})
                        
                    }
                    playerRef.current.enableRotation=true
                    let theta = (Math.asin(state.pointer.x / defaultZCamDiff)) 
                    const eulerRotation = new THREE.Euler(0, theta - ( Math.PI / 4 ), 0) //  + ( Math.PI / 2 )
                    // arms in line with camera with lead onto target
                    // later lerp or use animation
                    const quarternionRotation = new THREE.Quaternion().setFromEuler(eulerRotation)
                    playerRef.current.setRotation(quarternionRotation, true)
                    playerRef.current.enableRotation=false
           }
            



            // Later have html or sprite arrow for aiming direction
            // Aim: to have newspaper move back to pointer position, like loading for a throw
            // impulse direction taken from pointer position in relation to body
            // when canvasIsClicke == False; apply impulse
            // camera looks at centre in x and y

        }
        // throwing when pointer lifted
        if (aiming && !canvasIsClicked && throwingNewspaper.current) {
            let magnitudePointer = Math.max(Math.abs(state.pointer.x/50), Math.abs(state.pointer.y/50))
            let impulse = { x:-state.pointer.x/50, y: magnitudePointer, z:state.pointer.y/50 } // impulse paper in one spot
            throwSound.play()

            throwingNewspaper.current.applyImpulse(impulse)
            setThrown(true)
            addThrownPaperIndex(currentThrowingPaper)
            // setThrownIndexArray((prev) => [...prev, currentThrowingPaper]) // add further index to list
            setAiming(false)
            setIsAiming(false)
            
            setCurrentAction(actionsObject.throw)

            // below should be actioned on aiming but returned to pile if not thrown
            // setPaperQuantity((current) => current - 1)
            subtractPaperLeft()
            /**
             * below changes throwing newspaper to next in ref array
             * not actioned when last in ref array -> no further paper mesh to reference
             */
            if (currentThrowingPaper < startingNumPapers - 2) {

                throwingNewspaper = paperRefs.current[currentThrowingPaper + 1]

                // setCurrentThrowingPaper((current) => (current < papersLeft - 2 ) ? current + 1 : current)
            }
            /**
             * Initially can make hand disappear again
             *  hand should follow impulse path and follow through, then disappear
             */

            handRef.current.position.set([ 0, -5, -1 ])


        }
        
        /**
         * bug: linvel null after final paper is thrown
         * bug fixed: -3y triggered before paper is thrown
         * by checking that index is in the thrownIndexArray
         */

        if (thrownPaperLocations.length < currentThrowingPaper || (currentThrowingPaper == startingNumPapers - 1 && thrownPaperLocations.length == currentThrowingPaper)) { // perhaps check that current > 0 as players may throw 2 in quick succession
            // if not last index; use current index subtract 1. Otherwise if last index use current index.
            let diff = currentThrowingPaper - thrownPaperLocations.length
            let chosenIndex = currentThrowingPaper - diff
            let currentMesh = paperRefs.current[chosenIndex].current
                if ( thrownIndexArray.includes(chosenIndex) && ((currentMesh.linvel().y == 0 && currentMesh.linvel().z == 0) || currentMesh.translation().y < -3)) {
                    // add location to array
                    let newLocation = currentMesh.translation()
                    addPaperLocation(newLocation)

                }
        }
    })

    function initAim(event) {
        if (thrown) { // not actioned on first go; only after at least 1 has been thrown
            setThrown(false)
        }
        if (papersLeft > 0) {
            aimSound.play()

            // only if newspapers are left to throw!
            // Done: have object in place of newspaper - > cube for now
            // TODO: allow for drag of mouse -> distance of drag more force
            setPointLocation(event.point)
            setAiming(true)
            setIsAiming(true)
            setCurrentAction(actionsObject.aim)
            // on release -> throw newspaper
        }
    }

    const newspaperShell = (
    <>
        <boxGeometry args={ [ 0.03, 0.1, 0.5 ] } />
        <meshStandardMaterial flatShading color="white" />        
    </>
    )

    /**
     *     // TODO: sense that paper landed on house tile -> throwing paper before moved again
    // perhaps change thrown with normal paper mesh
    // each time thrown selected -> add mesh location to array -> if mesh velocity == 0
     */
        // if aiming have hand on paper? possible? - try cube - non rigidboy

    return <>

        <mesh
        ref={handRef}
        position={[ 0, -5, -1 ]}
        >
            <boxGeometry args={ [ 0.1, 0.1, 0.1 ] } />
            <meshStandardMaterial flatShading color="#E2B8B4" />
        </mesh>
    <RigidBody
        ref={ playerRef }
        restitution={ 0.2 }
        friction={ 1 } 
        // onPointerDown={initAim}
        linearDamping={ 0.5 }
        // angularDamping={ Infinity }
        position={ [ 0, 1, 0 ] }
        collisionGroup={1}
        enableRotation={false}
        colliders={"hull"}
        >
            {/* when throwing model to turn side on */}
        <BoyThrowing
            ref={ modelRef }
            rotation={[0, Math.PI, 0]}
            scale={1}
            action={currentAction}
            opacity={0.1}
            transparent={true}
        />
                    <Html>
                <div 
                    class="aiming-circle" 
                    // ref={aimingCircleRef} 
                    style={{ position: 'relative', left: '0%', top: '-0%', transform: 'translate(-50%, -450%)', fill: 'yellow', fillOpacity: 0.4}}
                    onPointerDown={initAim}
                >
                    {!aiming ? <div class="aiming-paper" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
                    <img 
                        src="001-drag-down.png"
                        height={40}
                    />
                    </div> : null}
                    <svg height="60" width="60">
                    </svg>
                </div>
            </Html>
        <CuboidCollider args={ [ 0.1, 0.05, 0.3 ] }/>
    </RigidBody>
            {/* TODO: allow click and drag to set and aim for throw; release for throw */}
    {/* newspaper meshes below -> bug on restart meshes still shown in thrown location */}
    {Array.from({length: startingNumPapers}, (_, index) => {
        return( ((aiming || thrown) && index <= currentThrowingPaper) ?
        <RigidBody
            ref={paperRefs.current[index]}
            restitution={ 0.2 }
            friction={ 1 } 
            linearDamping={ 0.5 }
            angularDamping={ 0.5 }
            // hack -> position off screen, then teleported above box when aiming
            position={[ 0, -5, -1 ]}
            collisionGroup={2}
            key={index}
        >
            <mesh castShadow>
            {newspaperShell}
            </mesh>
        </RigidBody> : null
        )       
    })}
    </>
}