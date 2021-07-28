const socket = io("https://foosball-live.herokuapp.com/")
const playerName = document.querySelector(".menu input") 

// Join socket io server
function startRoom() {
    socket.emit("standby", playerName.value)
    playerName.remove()
    MP_INFO.style.display = "block"
}

// Set player color based on position returned from server
socket.on("position", pos => {
    const result = document.querySelector(".result")
    switch(pos) {
        case 0:
            multiplayerPosition = 'LM'
            result.style.color = "blue"
            break 
        case 1:
            multiplayerPosition = 'RM'
            result.style.color = "red"
            break
        case 2:
            multiplayerPosition = 'LF'
            result.style.color = "blue"
            break 
        case 3:
            multiplayerPosition = 'RF'
            result.style.color = "red"
            break
        case 4:
            multiplayerPosition = 'LGK'
            result.style.color = "blue"
            break 
        case 5:
            multiplayerPosition = 'RGK'
            result.style.color = "red"
            break
        default: // Maximum players are present, so no side
            multiplayerPosition = "standby"
            result.style.color = "grey"
            break
    }
    result.textContent = "Your position on table: " + (pos + 1)
    result.style.visibility = "visible"
    setTimeout(() => result.style.visibility = "hidden", 5000)
});

// Update live player list
socket.on("players", players => {
    MP_INFO.innerHTML = `<h4 class="text-start">Players in server:</h4>`
    const div = document.createElement("div")
    div.classList.add("d-flex", "flex-wrap")
    for (let i = 0; i < players.length; i++) {
        const node = document.createElement("p")
        node.style.color = playersDict[i][0]
        node.textContent = `${players[i].pName} - ${playersDict[i][1]}`
        div.appendChild(node)
    }
    MP_INFO.appendChild(div)
})

// Sync scores and handles
socket.on("scorer", scorer => changeScore(scorer))
socket.on("updateHandle", (playerPosition, direction) => PLAYERS.filter(p => (p.side + p.tacticalPos) === playerPosition).forEach(p => p.move(direction)))
socket.on("updateHandleState", (handle, state) => HANDLES[handle].state = state)
socket.on("finishGame", (winnerSide, color) => finishGame(winnerSide, color))

// Color and position info for multiplayer
const playersDict = {
    0 : ["blue", "LM"],
    1 : ["red", "RM"],
    2 : ["blue", "LF"],
    3 : ["red", "RF"],
    4 : ["blue", "LGK"],
    5 : ["red", "RGK"]
}