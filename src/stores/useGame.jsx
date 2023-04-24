import { create } from "zustand";
import { checkIfOnTarget } from "../hooks/onTarget";


export default create((set) => {
    // not sure whether to have global state for house locations??
    return {
        startingNumPapers: 6,
        papersLeft: 6,
        papersDelivered: 0, // use onTarget
        thrownPaperLocations: [],
        targetLocations: [], // can have this in other logic?
        /** TODO: have location of thrown papers array
         * check against property/houses locations
         * if on property add to papersDelivered 
         * 
         *  */ 
        // function to remove paper from papersLeft -> called from Player
        subtractPaperLeft: () => {
            set((state) => {
                if (state.papersLeft > 0) 
                    return { papersLeft: state.papersLeft - 1}
                return{}
            })
        },

        addPaperLocation: (newLocation) => {
            console.log("useGame addLocation: ", newLocation)
            // check if onTarget
            /**
             * unclear if second set is actioned; perhaps have logic in helperfunctions?
             */

            set((state) => ({
                thrownPaperLocations: [...state.thrownPaperLocations, newLocation]

            }))
            
            
            set((state) => {
                console.log("useGame state.thrownPaperLocations: ", state.thrownPaperLocations)
                
                if (checkIfOnTarget(newLocation, state.targetLocations)) {
                    console.log("useGame onTarget: ")
                // if so add to papers delivered
                    return { papersDelivered: state.papersDelivered + 1}
                }
                return{}

            })
        },

        setTargetLocations: (locationArray) => {
            set(() => ({
                targetLocations: locationArray
            }))
        }

    }
})