import useGame from "./stores/useGame"

export default function Interface() {
    const papersLeft = useGame((state) => {return state.papersLeft}) // how to update?
    const startingNumPapers = useGame((state) => {return state.startingNumPapers}) // how to update?


    let papersThrown = startingNumPapers - papersLeft
    // cross emojis
    let crosses = ''
    for (let i = 0; i < papersThrown; i ++ ) {
        crosses += '❌'
    }

    let papers = ''
    for (let i = 0; i < startingNumPapers; i ++ ) {
        papers += '🗞️'
    }

    return (<div className="interface">
        {/* need to send in paper's left */}
        {/* initially remove rolled up paper -> later add cross on top ❌*/}
        <div className="papersLeft">{papers}</div>
        <div className="crossOverlayPapersLeft">{crosses}</div>
        <div className="papersDelivered">📰 0 / 6 </div>
    </div>)
}