import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware"
import { checkIfOnTarget } from "../hooks/onTarget";


export default create(subscribeWithSelector((set) => {
    return {
        startingNumPapers: 6, // will need object for each level
        papersLeft: 6,
        papersDelivered: 0, // use onTarget
        thrownPaperLocations: [],
        targetLocations: [],
        thrownIndexArray: [], 

        /**
         * Time
         */
        startTime: 0,
        endTime: 0,

        /**
         * Phases
         */
        phase: 'ready',
        start: () => {
            set((state) => {
                if (state.phase==='ready')
                    return { phase: 'playing', startTime: Date.now() }
                return {}
                
            })
        },
        // why is restart not actioned from interface??
        restart: () => { // perhaps also have reset/respawn -> maintain score and respawn
            console.log("restart")
            set((state) => {
                if (state.phase==='playing' || state.phase == 'ended')
                    return { phase: 'ready'}            
                return {}
            })
        },
        end: () => {
            set((state) => {
                if (state.phase==='playing'){console.log("end")}
                if (state.phase==='playing')
                    return { phase: 'ended', endTime: Date.now() }
                return {}
            })
        },


        // function to remove paper from papersLeft -> called from Player
        subtractPaperLeft: () => {
            set((state) => {
                if (state.papersLeft > 0) 
                return { papersLeft: state.papersLeft - 1}
                return{}
            })
        },

        resetPapers: () => {

            set(() => {
                return { thrownPaperLocations: [], papersLeft: state.startingNumPapers, papersDelivered: 0, thrownIndexArray: [] }
            })

            return {}
        },
        
        addPaperLocation: (newLocation) => {
            console.log("useGame addLocation: ", newLocation)
            
            set((state) => ({
                thrownPaperLocations: [...state.thrownPaperLocations, newLocation]
                
            }))
            
            
            /** 
             * check location of thrown paper against property/houses locations
             * if on property add to papersDelivered 
             * 
             *  */ 
            set((state) => {                
                if (checkIfOnTarget(newLocation, state.targetLocations)) {
                // if so add to papers delivered
                    return { papersDelivered: state.papersDelivered + 1}
                }
                return{}

            })
        },

        addThrownPaperIndex: (newIndex) => {
            console.log("newIndex: ", newIndex)
            set((state) => ({
                thrownIndexArray: [...state.thrownIndexArray, newIndex]
            }))
        },

        setTargetLocations: (locationArray) => {
            set(() => ({
                targetLocations: locationArray
            }))
        }

    }
}))