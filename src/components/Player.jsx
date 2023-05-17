import { CuboidCollider, CylinderCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState, createRef } from "react";
import * as THREE from "three"
import useGame from "../stores/useGame";
import {Scooter} from '../components/Scooter'

// isCanvasClicked sent as prop 
// TODO: perhaps double click for go forward tap to sides to switch lanes
// turn camera to where throwing at
export default function Player({canvasIsClicked}) {
    
    // Zustand states and functions
    const papersLeft = useGame((state) => {return state.papersLeft})
    const thrownPaperLocations = useGame((state) => {return state.thrownPaperLocations}) // probably not needed in this component
    const subtractPaperLeft = useGame((state) => state.subtractPaperLeft)
    const addPaperLocation = useGame((state) => state.addPaperLocation)
    // trial splitting addPaperLocation into two
    const checkIfPaperOnTarget = useGame((state) => state.checkIfPaperOnTarget)
    const start = useGame((state) => state.start)
    const restart = useGame((state) => state.restart)
    const end = useGame((state) => state.end)
    const resetPapers = useGame((state) => state.resetPapers)

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
    const bodyMesh = useRef()
    
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
        origin.y -= 0.31
        const direction = { x:0, y:-1, z:0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = rapierWorld.castRay(ray, 10, true)
        if (hit.toi < 0.1) {
            playerRef.current.applyImpulse({ x:0, y:0.05, z:0 })
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
        
        // below not working?

        playerRef.current.setAngvel({ x: 0, y: 0, z: 0 }) 
        playerRef.current.setRotation({ _x: 0, _y: 0, _z: 0, _w: 1 })
        playerRef.current.lockRotations()
        
        console.log(playerRef.current.rotation())
        
        // array of previous and current positions
        // find difference in the vectors
        // below was trial and error to get the newspaper to follow the player 
        // get the difference in the vectors and applyTranslation to the newspaper
        // translation can be applied to kinematic rigidbody

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(playerPosition)
        // y position constant (height above player)
        cameraPosition.y += 0.9
        // below only if aiming not true
        if (!aiming) {
        cameraPosition.z += 2.5}
        else {
            // get difference between player centre and position
            cameraPosition.x += state.pointer.x
            cameraPosition.z += Math.sqrt(Math.pow(2.5, 2) - Math.pow(state.pointer.x, 2))
            // if aiming true -> go on circular arc

        }

        
        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(playerPosition)

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
        
        if (aiming && canvasIsClicked) { // aiming
            /**
             * moves paper before throw is actioned on mouse up
            */
           
           if(!thrown && throwingNewspaper.current){
                console.log("throwingNewspaper.current: ", throwingNewspaper.current)
                // attempt -> paper always above body and transaparent paper with hand??
                // bug fixed: 2nd paper onwards throwing downwards
                // setLinVel == 0 to overcome velocity from free falling pre throw
                throwingNewspaper.current.setLinvel({x: 0, y: 0, z: 0})
                throwingNewspaper.current.setAngvel({ x: 0, y: 0, z: 0 }) 
                throwingNewspaper.current.setTranslation({x: playerPosition.x, y: playerPosition.y+0.6, z: playerPosition.z + 0.2})
                
                // console.log("paperQuantity: ", paperQuantity)
            }
            



            // Later have html or sprite arrow for aiming direction
            // Aim: to have newspaper move back to pointer position, like loading for a throw
            // impulse direction taken from pointer position in relation to body
            // when canvasIsClicke == False; apply impulse
            // camera looks at centre in x and y

        }
        // throwing when pointer lifted
        if (aiming && !canvasIsClicked && throwingNewspaper.current && !thrown) {
            // bug -> this is getting hit multiple times per throw!!
            // add in len(thrownArray) == throwing index


            setAiming(false)
            setThrown(true)
            // use pointer location @ release -> -1 to 1
            let magnitudePointer = Math.max(Math.abs(state.pointer.x/50), Math.abs(state.pointer.y/50))
            let impulse = { x:-state.pointer.x/50, y: magnitudePointer, z:state.pointer.y/50 } // impulse paper in one spot

            throwingNewspaper.current.applyImpulse(impulse)

            // should only be actioned once!!
            console.log("currentThrowingPaper", currentThrowingPaper, thrownIndexArray)
            /**
             * need if statement or guard against multiple
             */
            /**
             * below changes throwing newspaper to next in ref array
             * not actioned when last in ref array -> no further paper mesh to reference
            */
           if (currentThrowingPaper < startingNumPapers - 2) {
               
               throwingNewspaper = paperRefs.current[currentThrowingPaper + 1]
               console.log("currentThrowingPaper + 1: ", currentThrowingPaper + 1)
               // setCurrentThrowingPaper((current) => (current < papersLeft - 2 ) ? current + 1 : current)
            }
            addThrownPaperIndex(currentThrowingPaper) // adds current index to thrownIndexArray and moves currentThrowingPaper + 1 if not last index
            // setThrownIndexArray((prev) => [...prev, currentThrowingPaper]) // add further index to list
            // below should be actioned on aiming but returned to pile if not thrown
            // setPaperQuantity((current) => current - 1)
            subtractPaperLeft()
            /**
             * below changes state for current throwing newspaper
             * unclear if this should be actioned when last in ref array
             * perhaps set to null after final throw? -> would need checks that not null in throwing logic
             */
            // should be from global state -> to allow reset to zero
            // setCurrentThrowingPaper(Math.min(startingNumPapers - 1 ,startingNumPapers - papersLeft + 1))            

        }
        console.log("thrownIndexArray: ", thrownIndexArray)
        /**
         * bug: linvel null after final paper is thrown
         * bug fixed: -3y triggered before paper is thrown
         * by checking that index is in the thrownIndexArray
         */
        // console.log("currentThrowingPaper: ", currentThrowingPaper, thrownPaperLocations)
        if (thrownPaperLocations.length < currentThrowingPaper || (currentThrowingPaper == startingNumPapers - 1 && thrownPaperLocations.length == currentThrowingPaper)) { // perhaps check that current > 0 as players may throw 2 in quick succession
            // if not last index; use current index subtract 1. Otherwise if last index use current index.
            let diff = currentThrowingPaper - thrownPaperLocations.length
            let chosenIndex = currentThrowingPaper - diff
            let currentMesh = paperRefs.current[chosenIndex].current
            console.log("currentMesh: ", currentThrowingPaper, thrownPaperLocations, diff, chosenIndex)
            console.log("currentMeshTranslation: ",currentMesh.linvel() && currentMesh.linvel())
            console.log("thrownIndexArray.includes(chosenIndex) :", chosenIndex,thrownIndexArray.includes(chosenIndex) )
                if ( thrownIndexArray.includes(chosenIndex) && ((currentMesh.linvel().y == 0 && currentMesh.linvel().z == 0) || currentMesh.translation().y < -3)) {
                    // add location to array
                    let newLocation = currentMesh.translation()
                    checkIfPaperOnTarget(newLocation)
                    addPaperLocation(newLocation)

                }
        }
    })

    function initAim(event) {
        
        if (thrown) { // not actioned on first go; only after at least 1 has been thrown
            setThrown(false)
        }
        if (papersLeft > 0) {

            // only if newspapers are left to throw!
            // Done: have object in place of newspaper - > cube for now
            // TODO: allow for drag of mouse -> distance of drag more force
            setPointLocation(event.point)
            setAiming(true)
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


    return <>

    {/* TODO: allow click and drag to set and aim for throw; release for throw */}
    {/* Later: click area should be near character, allow from not on character later */}
    <RigidBody
        ref={ playerRef }
        restitution={ 0.2 }
        friction={ 1 } 
        linearDamping={ 0.5 }
        angularDamping={ 0.5 }
        position={ [ 0, 1, 0 ] }
        collisionGroup={1}
        >
        <CuboidCollider args={[0.2, 0.1, 0.2]} />
        <Scooter 
            ref={ bodyMesh } 
            castShadow
            onPointerDown={initAim}  
            rotation={[0, -Math.PI / 2, 0]} 
            scale={0.5}
            lockRotations={true}
            
            />
            {/* <mesh
                ref={ bodyMesh } 
                castShadow
                onPointerDown={initAim}
                >
    
                <boxGeometry args={ [ 0.3, 0.3, 0.3 ] } />
                <meshStandardMaterial flatShading color="mediumpurple" />
            </mesh> */}
    </RigidBody>
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