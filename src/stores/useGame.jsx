import { create } from "zustand";


export default create((set) => {
    return {
        startingNumPapers: 6,
        papersLeft: 6
    }
})