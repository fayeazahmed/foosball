// Foosball handle
class Handle {
    constructor(side = 'L', players, x) {
        this.side = side // player: side 'L' or 'R'
        this.players = players // Array of players attached to handle
        this.x = x
        ctx.lineWidth = 8
        this.state = "default" // default | kick | leave | hold | backpass
        this.color = side === 'L' ? "#414141" : "#1b2338"
    }

    draw() {
        ctx.strokeStyle = this.color
        ctx.beginPath()
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, HEIGHT);
        ctx.stroke();
        this.players.forEach(player => { // Draw players and animate if state is kick or backpass
            player.draw()
            if(this.state === "kick")
                ctx.fillRect(this.side === 'L' ? this.x : this.x - player.radius * 2 + 2, player.position.y - player.radius / 2, player.radius * 2 + 2, player.radius + 2)
            if(this.state === "backpass")
                ctx.fillRect(this.side === 'L' ? this.x - player.radius * 2 + 2 : this.x, player.position.y - player.radius / 2, player.radius * 2 + 2, player.radius + 2)
        });
    }
}

// Player attached to handle
class Player {
    constructor(yPos, side = 'L', pos = 'M') {
        this.side = side
        // Setting coordinates according to side
        this.tacticalPos = pos
        if(pos === 'M') {
            this.y = yPos * 16 * HEIGHT / 100
            this.x = this.side === 'L' ? WIDTH / 3 : 2 * WIDTH / 3
        } else if(pos === 'GK') {
            this.y = HEIGHT / 2
            this.x = this.side === 'L' ? WIDTH / 20 : WIDTH - WIDTH / 20
        } else {
            this.y = yPos * 24 * HEIGHT / 100
            this.x = this.side === 'R' ? WIDTH / 5 : 4 * WIDTH / 5
        }
        this.position = new Vector(this.x, this.y)
        this.velocity = new Vector(0, 0)
        this.color = this.side === 'L' ? "blue" : "red"
        this.radius = 14
    }

    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI)
        ctx.fill()
    }

    move(direction) {
        // Moving handles through y axis when event listener is called
        switch(direction) {
            case "up":
                this.position = new Vector(this.x, (this.position.y - 20))
                break
            case "down":
                this.position = new Vector(this.x, (this.position.y + 20))
                break
            default:
                break
        }
        this.draw()
    }
}

// Ball
class Ball {
    constructor() {
        this.radius = 12
        this.position = new Vector(WIDTH / 3 + this.radius / 2, HEIGHT / 2)
        this.velocity = new Vector(0, 0)
    }

    draw() {
        ctx.fillStyle = "white"
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
    }

    update() {
        this.detectCollision()
        // Checking if ball hit border of table
        if (this.position.y + this.radius >= HEIGHT || this.position.y - this.radius <= 0)
          this.velocity = new Vector(this.velocity.x, -this.velocity.y);
        if (this.position.x + this.radius >= WIDTH || this.position.x - this.radius <= 0)
            if((this.position.y + this.radius) > GOAL_Y1 && (this.position.y + this.radius) < GOAL_Y2)
                this.updateScore()
            else
                this.velocity = new Vector(-this.velocity.x, this.velocity.y);
        
        this.position = this.position.add(this.velocity)
        if(multiplayerPosition) {
            socket.on("updates", (p, v) => {
                this.position = new Vector(p.x, p.y)
                this.velocity = new Vector(v.x, v.y)
            })
            socket.emit("updates", this.position, this.velocity)
        }
        this.draw()
    }

    // Detect collision with players
    detectCollision() {
        PLAYERS.forEach(player => {
            const distance = this.position.subtract(player.position).magnitude;
            if (distance <= (this.radius + player.radius + player.radius / 2)) {
                switch (HANDLES[`${player.side + player.tacticalPos}`].state) {
                    case "default": // Do nothing if ball is coming from behind, else soft kick
                        if((this.position.x < (player.position.x + player.radius) &&  player.side === 'L') || (this.position.x > (player.position.x - player.radius) &&  player.side === 'R')) 
                            return
                        else
                            player.velocity = player.side === 'L' ?  new Vector(5, 0) : new Vector(-5, 0)
                            this.velocity = collisionVector(this, player);
                            break
                    case "kick": // Get +20 velocity towards opposite goal bar
                        if((player.side === 'L' && this.position.x > player.position.x) || (player.side === 'R' && this.position.x < player.position.x))
                            this.velocity = this.velocityTowardsGoal(player.side)
                        return
                    case "leave": // Ignore collision (ball will go underneath)
                        return
                    case "hold": // Attach ball to player if close enough
                        if((player.side === 'L' && this.position.x < (player.position.x + player.radius)) || (player.side === 'R' && this.position.x > (player.position.x - player.radius)))
                            this.velocity = new Vector(0, 0)
                            this.position = new Vector(this.position.x, player.position.y)
                        break
                    case "backpass": // Get +5 velocity towards self goal bar
                        if(player.side === 'L' && this.position.x < player.position.x)
                            this.velocity = new Vector(-5, 0)
                        if(player.side === 'R' && this.position.x > player.position.x)
                            this.velocity = new Vector(5, 0)
                        break
                    default:
                        return;
                }
            } 
        })
    }

    // Set Vx and Vy when kicked according to ball position in field
    velocityTowardsGoal(side, playerY) {
        if(HEIGHT / 2 - this.position.y > 0) 
            return new Vector(side === 'L' ? 20 : -20, this.position.y > playerY ? 4 : 1)
        else
            return new Vector(side === 'L' ? 20 : -20, this.position.y > playerY ? -1 : -4)
    }

    // Confirm goal and re-place the ball
    updateScore() {
        const scorer = this.position.x < WIDTH / 2 ? "P2" : "P1"
        this.position = new Vector(this.position.x < WIDTH / 2 ? WIDTH / 3 + this.radius / 2 : WIDTH - WIDTH / 3 - this.radius / 2, HEIGHT / 2)
        changeScore(scorer)
        if(multiplayerPosition)
            socket.emit("scorer", scorer)
        this.velocity = new Vector(0, 0)
        SCORE["P1"] === 10 && finishGame("P1 [LEFT]", "blue") && socket.emit("finishGame", "P1 [LEFT]", "blue")
        SCORE["P2"] === 10 && finishGame("P2 [RIGHT]", "red") && socket.emit("finishGame", "P2 [RIGHT]", "red")
    }
}