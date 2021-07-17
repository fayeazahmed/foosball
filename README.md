
## Basic info:

<ul>

<li>This is foosball (table football) tried on html canvas.</li>

<li> Each side got 3 handles containing 5 mid players, 3 on defense and 1 goalkeeper.</li>

<li>After every goal, the ball is re-placed at gk of goal conceding team</li>

<li>First side to score 10 goals wins, then match restarts.</li>
<li>Single player is basically practice mode, where both sides have to becontrolled. Main target is creating the live multiplayer version</li>
</ul>

## Control:
<ul>

<li>Handle actions activate when cursor is close enough to the handle</li>

<li>Rotate wheel to move handles</li>

<li>Left click towards opponent goal to kick ball</li>

<li>Left click towards own post to backpass</li>

<li>Holding right button let the ball go underneath player</li>

<li>Click wheel at right moment to hold ball using adjacent player</li>

<li>While holding, rotate to move with the ball</li>

</ul>

I thought of building while trying to learn HTML Canvas. This is also the first project where I commented everything out properly so that anyone can understand whatever's happening wherever.<br>
So basically there are two canvases. One is for drawing the background field only. Used this extra canvas so that the whole field doesn't have to be drawn at every render. Another canvas holds the actual dynamic game objects like handle, players and the ball. The movements were tracked in the 2d coordinate using [Vector class](https://joshbradley.me/object-collisions-with-canvas/). This is the simplified version of what's happening in the game loop- Ball is constantly getting redrawn on current position and position is changing according to velocity. Ball direction and velocity changes when collided with other player or border according to handle state (leave/kick etc). If ball goes through any goal line, score is updated and everything is redrawn if a player scores ten.