// Initialize, get convas context and size
const canvas = document.getElementById("canvas") // Main canvas
const bgCanvas = document.querySelectorAll("canvas")[0] // Canvas containing background drawings
canvas.height = innerWidth / 2.5
canvas.width = innerWidth
bgCanvas.height = innerWidth / 2.5
bgCanvas.width = innerWidth
document.querySelectorAll(".score")[1].style.marginTop = innerWidth / 2.5 + "px" // Set bottom score board bellow canvas 
const HEIGHT = canvas.height
const WIDTH = canvas.width
const ctx = canvas.getContext("2d")
const ctxBg = bgCanvas.getContext("2d")

const GOAL_Y1 = HEIGHT / 2.8 // Goal line y1
const GOAL_Y2 = GOAL_Y1 + HEIGHT / 3.5 // Goal line y2

let CURSOR_X; // Track x coordinate of cursor while inside canvas
let HANDLES; // Handles
let PLAYERS = [] // Array for players
let SCORE = {
    "P1" : 0,
    "P2" : 0
}
let multiplayerPosition;

// Other dom objects
const howToBtn = document.querySelector(".menu button")
howToBtn.addEventListener("click", () => document.querySelectorAll(".page").forEach(page => page.classList.toggle("d-none")))
const MP_INFO = document.querySelector(".mp-info")