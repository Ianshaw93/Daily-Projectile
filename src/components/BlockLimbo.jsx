
function BlockLimbo({ position = [ 0, 0, 0 ]}) {
    const obstacleRef = useRef()
    const [ timeOffset ] = useState(() => Math.random()*2*Math.PI)

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const y = Math.sin(time + timeOffset) + 1.15
        obstacleRef.current.setNextKinematicTranslation({x: y, y: position[1], z: position[2]})

    })

return <group position={position} >
    <mesh geometry={ boxGeometry } material={floor2Material} position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] } receiveShadow />
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

export default BlockLimbo