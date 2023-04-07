import { create } from "zustand";


export default create((set) => {
    return {
        startingNumPapers: 6,
        papersLeft: 6,

        // function to remove paper from papersLeft -> to be called from Player
        subtractPaperLeft: () => {
            set((state) => {
                // console.log("", state.papersLeft)
                if (state.papersLeft > 0) 
                    return { papersLeft: state.papersLeft - 1}
                return{}
            })
        }

    }
})