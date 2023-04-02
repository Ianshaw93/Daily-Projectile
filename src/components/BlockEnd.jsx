function BlockEnd({ position = [ 0, 0, 0 ]}) {
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

export default BlockEnd