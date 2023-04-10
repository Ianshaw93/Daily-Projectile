import { create } from "zustand";


export default create((set) => {
    return {
        startingNumPapers: 6,
        papersLeft: 6,
        papersDelivered: 0,
        thrownPaperLocations: [],
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
            set((state) => ({
                thrownPaperLocations: [...state.thrownPaperLocations, newLocation]

            }))
        }

    }
})