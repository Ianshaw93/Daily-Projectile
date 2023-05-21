import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware"
import { checkIfOnTarget } from "../hooks/onTarget";


export default create(subscribeWithSelector((set) => {
    return {
        startingNumPapers: 6, // will need object for each level
        papersLeft: 6,
        papersDelivered: 0, // use onTarget
        currentThrowingPaper: 0,
        thrownPaperLocations: [],
        targetLocations: [],
        thrownIndexArray: [],
        distanceArray: [],
        minDistance: null, 

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
            // current throwing newspaper needs to reset to zero also
            set((state) => {
                return { thrownPaperLocations: [], papersLeft: state.startingNumPapers, papersDelivered: 0, thrownIndexArray: [] }
            })

            return {}
        },
        
        addPaperLocation: (newLocation) => {
            
            set((state) => ({
                thrownPaperLocations: [...state.thrownPaperLocations, newLocation]
                
            }))
            
            console.log("useGame addLocation: ", newLocation)
            
            /** 
             * check location of thrown paper against property/houses locations
             * if on property add to papersDelivered 
             * 
             *  */ 
            set((state) => { 
                let [isOnTarget, distance] = checkIfOnTarget(newLocation, state.targetLocations) 
                distance = (distance * 10).toFixed(2) 
                let scale = 10  
                console.log ("onTarget distance: ", distance, isOnTarget)           
                if (isOnTarget) {
                    console.log ("onTarget distance: ", distance)
                    
                    // return distance
                // if so add to papers delivered
                    if (state.minDistance == null || distance < state.minDistance) {
                        return { papersDelivered: state.papersDelivered + 1, 
                            distanceArray: [...state.distanceArray, distance],
                            minDistance: distance
                    }
                    } else{
                    
                        return { papersDelivered: state.papersDelivered + 1, 
                                distanceArray: [...state.distanceArray, distance]
                        }
                }
                } else {
                    return {
                        distanceArray: [...state.distanceArray, distance]
                    }
                }
                return{}

            })
        },


        addThrownPaperIndex: (newIndex) => {
            console.log("newIndex: ", newIndex, newIndex < 6 - 2)
            // console.log("newIndex: ", newIndex, (newIndex < startingNumPapers - 2) ? currentThrowingPaper + 1: currentThrowingPaper )
            set((state) => ({
                thrownIndexArray: [...state.thrownIndexArray, newIndex],
                currentThrowingPaper: (newIndex < state.startingNumPapers - 1) ? state.currentThrowingPaper + 1: state.currentThrowingPaper 
            }))
            return{}


        },

        setTargetLocations: (locationArray) => {
            set(() => ({
                targetLocations: locationArray
            }))
        }

    }
}))