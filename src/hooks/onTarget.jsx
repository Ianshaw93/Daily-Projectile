// goal -> compare locations of target meshes to thrown papers
// send in paper location
// traverse scene
// find locations of each target mesh (bounding box or similar)
// check if newspaper within target area
// return true/false
// import { useEffect } from 'react';


export function checkIfOnTarget(paperLocation, targetLocations) { 
    // const targetLocations = useGame((state) => {return state.targetLocations}) 
    console.log("useOnTarget hook!")
    console.log("paperLocation: ", paperLocation)

    for (let i=0; i<targetLocations.length; i++) {
      // vector paperLocation to centre of current
      let currentTarget = targetLocations[i]
      console.log("currentTarget: ", currentTarget)
      let currentCentre = currentTarget.centre
      let currentMaxDelta = currentTarget.maxDelta 
      console.log("centreX: ", currentCentre[0])
      console.log("paperX: ",paperLocation.x)

      let currentVectorDelta = [
                                paperLocation.x-currentCentre[0], 
                                paperLocation.y-currentCentre[1], 
                                paperLocation.z-currentCentre[2]
                              ]
      /**
       * check that paper location is on any target area
       */
      if (Math.abs(currentVectorDelta[0]) <= Math.abs(currentMaxDelta[0]) || Math.abs(currentVectorDelta[1]) <= Math.abs(currentMaxDelta[1]) || Math.abs(currentVectorDelta[2]) <= Math.abs(currentMaxDelta[2])) {
        return true
      }

    }
  // useEffect(() => {
  //   // Function to recursively traverse the scene graph and access bounding boxes
  //   // unclear if bounding boxes are permanent and need to be removed?
  //   const traverseScene = (obj) => {
  //     obj.traverse((child) => {
  //       if (child.isMesh && child.userData.isTarget) {
  //         // Check if the mesh has the userData property with the desired value
  //         const boundingBox = new THREE.Box3().setFromObject(child);
  //         console.log('Bounding box for mesh:', child.name, boundingBox);
  //         // Use the boundingBox object as needed (e.g. for collision detection, etc.)
  //       }
  //     });
  //   };

  //   traverseScene(scene); // Call the traverseScene function starting from the scene object
  // }, [scene]);

  return false;
    // check if mesh does not have boundingbox?
}