function BlockSpinner({ position = [ 0, 0, 0 ]}) {
    const obstacleRef = useRef()
    const [ speed ] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1))

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const eulerRotation = new THREE.Euler(0, time * speed, 0)
        const quarternionRotation = new THREE.Quaternion().setFromEuler(eulerRotation)
        obstacleRef.current.setNextKinematicRotation(quarternionRotation, true)

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

export default BlockSpinner