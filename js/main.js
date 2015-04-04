var interactive = true;

// Create an new instance of a pixi stage.
var stage = new PIXI.Stage(0x000000, interactive);
stage.buttonMode = true;

var WIDTH = 800;
var HEIGHT = 500;
var P_WIDTH = 16;
var P_HEIGHT = 80;
var B_WIDTH = 8;
var B_HEIGHT = 8;

// Create a renderer instance.
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, {
  view: document.getElementById('main')
});

requestAnimFrame(animate);

var score = 0;
var scoreText = new PIXI.Text(score, {font:"bold 50px Arial", fill:"#fff"});
scoreText.position.x = WIDTH/2 - 25;
scoreText.position.y = 12;
stage.addChild(scoreText);

var highScore = 0;
var highScoreText = new PIXI.Text(highScore, {
  font:"bold 30px Arial", fill:"#ccc"
});
highScoreText.visible = false
highScoreText.position.x = WIDTH/2 + 25;
highScoreText.position.y = 20;
stage.addChild(highScoreText);

// Create a texture.
var paddle_texture = PIXI.Texture.fromImage('paddle.png');
// Create two sprites using the same texture.
var paddle_left = new PIXI.Sprite(paddle_texture);
var paddle_right = new PIXI.Sprite(paddle_texture);

var ball_texture = PIXI.Texture.fromImage('ball.png');
var ball = new PIXI.Sprite(ball_texture);

// Position and size the paddles.
paddle_left.position.x = P_WIDTH;
paddle_left.position.y = HEIGHT * 0.5;
paddle_left.width = P_WIDTH;
paddle_left.height = P_HEIGHT;

paddle_right.position.x = WIDTH - P_WIDTH * 2;
paddle_right.position.y = HEIGHT * 0.5;
paddle_right.width = P_WIDTH;
paddle_right.height = P_HEIGHT;

// Add the paddles to the stage.
stage.addChild(paddle_left);
stage.addChild(paddle_right);

// Position and size the ball
function resetBall() {
  ball.position.x = WIDTH/2;
  ball.position.y = HEIGHT/2;
  // Velocity is not a built in property
  ball.velocity = {
    x: (Math.random() > 0.5 ? -1 : 1) * 4,
    y: (Math.random() > 0.5 ? -1 : 1) * 4
  }
}
resetBall();

// Add the ball to the stage.
stage.addChild(ball);

// The width that the user can use to control the paddles.
var MOVABLE_WIDTH = WIDTH - 12 * P_WIDTH;

stage.defaultCursor = 'none';

// Move the paddles
stage.mousemove = function(data) {
  if (data.global.x > WIDTH - 6 * P_WIDTH ||
      data.global.x < 6 * P_WIDTH) {
    return;
  }

  var scale = (HEIGHT - P_HEIGHT)/MOVABLE_WIDTH;
  var scaledPos = scale * (data.global.x - WIDTH/2);
  paddle_left.position.y =  HEIGHT/2 + scaledPos - P_HEIGHT/2;
  paddle_right.position.y = HEIGHT/2 - scaledPos - P_HEIGHT/2;
};

function gameOver() {
  if (score > highScore) {
    highScore = score;
  }
  highScoreText.setText(highScore);
  highScoreText.visible = true;

  score = 0;
  scoreText.setText(score);
  resetBall();
}

function scorePoint() {
  score += 1;
  scoreText.setText(score);
  if (score >= highScore) {
    highScore = score;
    highScoreText.setText(highScore);
  }
}

function updateBallPosition() {
  // Detect if the ball is about to bounce off the top or bottom wall;
  var y_pos_dist = (HEIGHT - B_HEIGHT - ball.position.y);
  var y_neg_dist = -1 * (ball.position.y);
  if (y_pos_dist == 0 || y_neg_dist == 0) {
    ball.velocity.y = -1 * ball.velocity.y;
    ball.position.y = ball.position.y + ball.velocity.y;
  } else if (y_pos_dist < ball.velocity.y) {
    ball.velocity.y = -1 * ball.velocity.y;
    ball.position.y = ball.position.y + ball.velocity.y;
  } else if (y_neg_dist > ball.velocity.y) {
    ball.velocity.y = -1 * ball.velocity.y;
    ball.position.y = ball.position.y + ball.velocity.y;
  } else {
    ball.position.y = ball.position.y + ball.velocity.y;
  }

  if (ball.position.x < 3 * P_WIDTH) {
    // Try to detect left paddle hit
	  var xdist = ball.position.x - paddle_left.position.x;
    if(xdist < paddle_left.width && xdist > -1 * paddle_left.width) {
		  var ydist = ball.position.y - paddle_left.position.y;
		  if(ydist < paddle_left.height && ydist > 0) {
        scorePoint();
        ball.velocity.x = -1 * ball.velocity.x;
        ball.position.x = paddle_left.position.x + paddle_left.width + 2;
		  }
	  }
  }

  if (ball.position.x > WIDTH - 3 * P_WIDTH) {
    // Try to detect left paddle hit
	  var xdist = ball.position.x - paddle_right.position.x;
    if(xdist < paddle_right.width && xdist > -1 * paddle_right.width) {
		  var ydist = ball.position.y - paddle_right.position.y;
		  if(ydist < paddle_right.height && ydist > 0) {
        scorePoint();
        ball.velocity.x = -1 * ball.velocity.x;
        ball.position.x = paddle_right.position.x - paddle_right.width - 2;
		  }
	  }
  }

  if (ball.position.x < 0 || ball.position.x > WIDTH) {
    gameOver();
  }

  ball.position.x = ball.position.x + ball.velocity.x;
}

function animate() { 
  requestAnimFrame(animate);

  updateBallPosition();

  // render the stage   
  renderer.render(stage);
}
