// Draw lines inside canvas
function drawTable() {
    // Get canvas size and set color white
    ctxBg.strokeStyle = "white";
    ctxBg.lineWidth = 8
    const HEIGHT = canvas.height
    const WIDTH = canvas.width

    // Rectangles
    ctxBg.strokeRect(2, HEIGHT / 4, WIDTH / 7 , HEIGHT / 2)
    ctxBg.strokeRect(WIDTH - WIDTH / 7 - 2, HEIGHT / 4, WIDTH / 7 , HEIGHT / 2)
    ctxBg.strokeRect(2, GOAL_Y1, WIDTH / 15 , HEIGHT / 3.5)
    ctxBg.strokeRect(WIDTH - WIDTH / 15 - 2, GOAL_Y1, WIDTH / 15 , HEIGHT / 3.5)

    // Goal lines
    ctxBg.beginPath()
    ctxBg.moveTo(2, 0);
    ctxBg.lineTo(2, HEIGHT);
    ctxBg.stroke();
    ctxBg.beginPath()
    ctxBg.moveTo(WIDTH, 0);
    ctxBg.lineTo(WIDTH, HEIGHT);
    ctxBg.stroke();

    // Center
    ctxBg.beginPath()
    ctxBg.moveTo(WIDTH / 2, 0);
    ctxBg.lineTo(WIDTH / 2 - 4, HEIGHT);
    ctxBg.stroke();
    ctxBg.beginPath()
    ctxBg.arc(WIDTH / 2 - 4, HEIGHT / 2, WIDTH / 14, 0, Math.PI * 2);
    ctxBg.stroke();

    // Semi circles
    ctxBg.beginPath()
    ctxBg.arc(WIDTH / 7, HEIGHT / 2, WIDTH / 14, Math.PI / 2, 3 * Math.PI / 2, true);
    ctxBg.stroke();
    ctxBg.beginPath()
    ctxBg.arc(WIDTH - WIDTH / 7, HEIGHT / 2, WIDTH / 14, Math.PI / 2, 3 * Math.PI / 2);
    ctxBg.stroke();

    // Corners
    ctxBg.beginPath()
    ctxBg.arc(0, 0, HEIGHT / 15, 0, Math.PI / 2);
    ctxBg.stroke();
    ctxBg.beginPath()
    ctxBg.arc(WIDTH, 0, HEIGHT / 15, Math.PI / 2, Math.PI * 2);
    ctxBg.stroke();
    ctxBg.beginPath()
    ctxBg.arc(0, HEIGHT, HEIGHT / 15, 0, 3 * Math.PI / 2, true);
    ctxBg.stroke();
    ctxBg.beginPath()
    ctxBg.arc(WIDTH, HEIGHT, HEIGHT / 15, Math.PI / 2, Math.PI * 2);
    ctxBg.stroke();
}

// Create handles and players
function placeHandles() {
    let LMPlayers = [] // Mid
    let RMPlayers = []
    let LFPlayers = [] // Defense
    let RFPlayers = []
    let gkL, gkR; // GKs

    for(let p = 1; p <= 5; p++) {
        if(p === 1) { // Create gk
            gkL = new Player(p, 'L', 'GK')
            gkR = new Player(p, 'R', 'GK')
        }
        if([1, 2, 3].includes(p)) { // Create defenders
            LFPlayers.push(new Player(p, 'L', 'F'))
            RFPlayers.push(new Player(p, 'R', 'F'))
        }
        LMPlayers.push(new Player(p, 'L', 'M')) // Create midfielders
        RMPlayers.push(new Player(p, 'R', 'M'))
    }
    
    // Creating and appending all handles to HANDLES dictionary
    const leftMid = new Handle('L', LMPlayers, WIDTH / 3)
    const rightMid = new Handle('R', RMPlayers, WIDTH - WIDTH / 3)
    const rightForward = new Handle('R', RFPlayers, WIDTH / 5)
    const leftForward = new Handle('L', LFPlayers, WIDTH - WIDTH / 5)
    const leftGK = new Handle('L', [gkL], WIDTH / 20)
    const rightGK = new Handle('R', [gkR], WIDTH - WIDTH / 20)
    HANDLES = {
        "LM" : leftMid,
        "RM" : rightMid,
        "LF" : leftForward,
        "RF" : rightForward,
        "LGK" : leftGK,
        "RGK" : rightGK
    }
    PLAYERS = [...LMPlayers, ...RMPlayers, ...LFPlayers, ...RFPlayers, gkL, gkR]
    updateHandles()
}

// ENTRY POINT
drawTable()
placeHandles()
placeScoreBoard()
const ball = new Ball()
ball.draw()
startGameLoop()

// Set cursorX coordinate in global varibale 
canvas.addEventListener("mousemove", e => CURSOR_X = e.offsetX)

// Change state of nearby handle to kick or backpass
canvas.addEventListener("mousedown", (e) => {
    const handle = HANDLES[mousePositionInField()]
    if(!handle)
        return
    if(!multiplayerPosition || hasControlPermission(handle))
        if(e.button === 0) {
            if(handle.side === 'L')
                handle.state = CURSOR_X > handle.x ? "kick" : "backpass"
            else
                handle.state = CURSOR_X < handle.x ? "kick" : "backpass"
        } else if(e.button === 2)
            handle.state = "leave"
        else
            handle.state = "hold"
    else
        return
    if(multiplayerPosition)
        socket.emit("updateHandleState", mousePositionInField(), handle.state)
})

// Prevent default action of right click
canvas.addEventListener("contextmenu", e => e.preventDefault())

// Return handle to default state
canvas.addEventListener("mouseup", () => {
    const handle = HANDLES[mousePositionInField()]
    if(!handle)
        return
    if(!multiplayerPosition || hasControlPermission(handle))
        handle.state = "default"
    else
        return
    if(multiplayerPosition)
        socket.emit("updateHandleState", mousePositionInField(), handle.state)
})

// Move player based on wheel rotation and cursor position
canvas.addEventListener('wheel', (e) => {
    const handle = HANDLES[mousePositionInField()]
    if(!handle)
        return
    const players = handle.players
    const direction = e.deltaY > 0 ? "down" : "up"
    if(!multiplayerPosition || hasControlPermission(handle))
        for(let i = 0; i < players.length; i++)
            players[i].move(direction)
    if(multiplayerPosition)
        socket.emit("updateHandle", (players[0].side + players[0].tacticalPos), direction)
})

// Check if player has permission to control handle in multiplayer
function hasControlPermission(handle) {
    return (handle.players[0].side + handle.players[0].tacticalPos) === multiplayerPosition
}

// Calling requestAnimationFrame here
function startGameLoop() {
    requestAnimationFrame(startGameLoop)
    ctx.clearRect(0 , 0, WIDTH, HEIGHT)
    ball.update()
    updateHandles()
}

// Draw all handles
function updateHandles() {
    for (const handle of Object.values(HANDLES))
        handle.draw()
}

// Return field position to access handle from cursorX
function mousePositionInField() {
    if(CURSOR_X > 0 && CURSOR_X < WIDTH / 20 + 50)
        return "LGK"
    if(CURSOR_X > WIDTH / 5 - 50 && CURSOR_X < WIDTH / 5 + 50)
        return "RF"
    if(CURSOR_X > WIDTH / 3 - 50 && CURSOR_X < WIDTH / 3 + 50)
        return "LM"
    if(CURSOR_X > (WIDTH - WIDTH / 3) - 50 && CURSOR_X < (WIDTH - WIDTH / 3) + 50)
        return "RM"
    if(CURSOR_X > (WIDTH - WIDTH / 5) - 50 && CURSOR_X < (WIDTH - WIDTH / 5) + 50)
        return "LF"
    if(CURSOR_X > (WIDTH - WIDTH / 20) - 50 && CURSOR_X < (WIDTH - WIDTH / 20) + 50)
        return "RGK"
}

// Place 10 balls at each side to track score
function placeScoreBoard() {
    const scoreBoards = document.querySelectorAll(".score")
    scoreBoards[0].innerHTML = scoreBoards[1].innerHTML = ""
    const start = document.createElement("div")
    start.classList.add("start", "d-flex")
    const end = document.createElement("div")
    end.classList.add("end", "d-flex")
    for(let i = 0; i < 10; i++) {
        const ball = document.createElement("div")
        ball.classList.add("ball")
        start.appendChild(ball.cloneNode(true))
    }
    scoreBoards[0].appendChild(start.cloneNode(true))
    scoreBoards[1].appendChild(start.cloneNode(true))
    scoreBoards[0].appendChild(end.cloneNode(true))
    scoreBoards[1].appendChild(end.cloneNode(true))
}

// Remove one ball from start and place in end
function changeScore(scorer) {
    SCORE[scorer]++
    const scoreBoard = document.getElementsByClassName(scorer)[0]
    const start = scoreBoard.querySelector(".start")
    start.removeChild(start.lastChild)
    const ball = document.createElement("div")
    ball.classList.add("ball")
    const end = scoreBoard.querySelector(".end")
    end.appendChild(ball)
}

// Display result and re-start
function finishGame(winnerSide, color) {
    const result = document.querySelector(".result")
    result.style.color = color
    result.textContent = winnerSide + " HAS WON"
    result.style.visibility = "visible"
    SCORE["P1"] = SCORE["P2"] = 0
    placeHandles()
    placeScoreBoard()
    setTimeout(() => result.style.visibility = "hidden", 5000)
}

// Open socket to server for MULTIPLAYER mode
playerName.addEventListener("keydown", e => e.key === "Enter" && playerName.value.length > 0 && startRoom())