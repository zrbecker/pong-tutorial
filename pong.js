const Pong = (function () {
  let canvas = null;

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;

  const WALL_WIDTH = 10;

  const PADDLE_PADDING = 10;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 100;
  const PADDLE_SPEED = 150; // Pixels per second

  const BALL_RADIUS = 10;
  const BALL_SPEED = 250; // Pixels per second
  const BALL_START_X = GAME_WIDTH / 2;
  const BALL_START_Y = GAME_HEIGHT / 2;

  const SCORE_PADDING_TOP = 10;
  const SCORE_PADDING_INNER = 10;

  const keyState = {};

  const gameState = {
    ball: { x: BALL_START_X, y: BALL_START_Y, ...randomBallDirection() },
    leftPaddle: {
      x: PADDLE_PADDING,
      y: (GAME_HEIGHT - PADDLE_HEIGHT) / 2,
      score: 0,
    },
    rightPaddle: {
      x: GAME_WIDTH - PADDLE_WIDTH - PADDLE_PADDING,
      y: (GAME_HEIGHT - PADDLE_HEIGHT) / 2,
      score: 0,
    },
  };

  function init(element) {
    if (canvas) {
      console.error("Pong is already initialized.");
      return;
    }
    canvas = element;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    window.addEventListener("keydown", keydownHandler);
    window.addEventListener("keyup", keyupHandler);

    startGameLoop();
  }

  function cleanup() {
    if (!canvas) {
      console.error("Pong is already cleaned up.");
      return;
    }
    canvas = null;

    window.removeEventListener("keydown", keydownHandler);
    window.removeEventListener("keyup", keyupHandler);
  }

  function keydownHandler(event) {
    keyState[event.code] = true;
  }

  function keyupHandler(event) {
    keyState[event.code] = false;
  }

  function startGameLoop() {
    const loopCallback = function () {
      const current = performance.now();
      update((current - last) / 1000);
      last = current;
      render();
      window.requestAnimationFrame(loopCallback);
    };
    let last = performance.now();
    window.requestAnimationFrame(loopCallback);
  }

  function randomBallDirection() {
    const angle = Math.PI / 4 + ((Math.PI / 6) * Math.random() - Math.PI / 16);
    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = Math.random() > 0.5 ? 1 : -1;
    return { dx: dirX * Math.cos(angle), dy: dirY * Math.sin(angle) };
  }

  function update(deltaTime) {
    // Left Paddle Update
    if (keyState["KeyQ"]) {
      gameState.leftPaddle.y -= PADDLE_SPEED * deltaTime;
    }
    if (keyState["KeyA"]) {
      gameState.leftPaddle.y += PADDLE_SPEED * deltaTime;
    }
    gameState.leftPaddle.y = Math.min(
      GAME_HEIGHT - WALL_WIDTH - PADDLE_HEIGHT,
      Math.max(WALL_WIDTH, gameState.leftPaddle.y)
    );

    // Right Paddle Update
    if (keyState["KeyP"]) {
      gameState.rightPaddle.y -= PADDLE_SPEED * deltaTime;
    }
    if (keyState["KeyL"]) {
      gameState.rightPaddle.y += PADDLE_SPEED * deltaTime;
    }
    gameState.rightPaddle.y = Math.min(
      GAME_HEIGHT - WALL_WIDTH - PADDLE_HEIGHT,
      Math.max(WALL_WIDTH, gameState.rightPaddle.y)
    );

    // Ball Update
    const length = Math.sqrt(
      gameState.ball.dx * gameState.ball.dx +
        gameState.ball.dy * gameState.ball.dy
    );
    gameState.ball.dx *= BALL_SPEED / length;
    gameState.ball.dy *= BALL_SPEED / length;

    gameState.ball.x += gameState.ball.dx * deltaTime;
    gameState.ball.y += gameState.ball.dy * deltaTime;

    // Wall collision
    if (gameState.ball.dy < 0 && gameState.ball.y - BALL_RADIUS < WALL_WIDTH) {
      gameState.ball.dy *= -1;
    }
    if (
      gameState.ball.dy > 0 &&
      gameState.ball.y + BALL_RADIUS > GAME_HEIGHT - WALL_WIDTH
    ) {
      gameState.ball.dy *= -1;
    }

    // Left paddle collision
    if (
      gameState.ball.dx < 0 &&
      !(
        gameState.ball.x - BALL_RADIUS >
          gameState.leftPaddle.x + PADDLE_WIDTH ||
        gameState.ball.x + BALL_RADIUS < gameState.leftPaddle.x ||
        gameState.ball.y - BALL_RADIUS >
          gameState.leftPaddle.y + PADDLE_HEIGHT ||
        gameState.ball.y + BALL_RADIUS < gameState.leftPaddle.y
      )
    ) {
      gameState.ball.dx *= -1;
    }

    // Right paddle collision
    if (
      gameState.ball.dx > 0 &&
      !(
        gameState.ball.x - BALL_RADIUS >
          gameState.rightPaddle.x + PADDLE_WIDTH ||
        gameState.ball.x + BALL_RADIUS < gameState.rightPaddle.x ||
        gameState.ball.y - BALL_RADIUS >
          gameState.rightPaddle.y + PADDLE_HEIGHT ||
        gameState.ball.y + BALL_RADIUS < gameState.rightPaddle.y
      )
    ) {
      gameState.ball.dx *= -1;
    }

    // Score
    if (gameState.ball.x + BALL_RADIUS < 0) {
      gameState.rightPaddle.score += 1;
    }

    if (gameState.ball.x - BALL_RADIUS > GAME_WIDTH) {
      gameState.leftPaddle.score += 1;
    }

    // Reset ball
    if (
      gameState.ball.y + BALL_RADIUS < 0 ||
      gameState.ball.y - BALL_RADIUS > GAME_HEIGHT ||
      gameState.ball.x + BALL_RADIUS < 0 ||
      gameState.ball.x - BALL_RADIUS > GAME_WIDTH
    ) {
      gameState.ball = {
        x: BALL_START_X,
        y: BALL_START_Y,
        ...randomBallDirection(),
      };
    }
  }

  function render() {
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, GAME_WIDTH, WALL_WIDTH);
    ctx.fillRect(0, GAME_HEIGHT - WALL_WIDTH, GAME_WIDTH, WALL_WIDTH);

    ctx.fillRect(
      gameState.leftPaddle.x,
      gameState.leftPaddle.y,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );
    ctx.fillRect(
      gameState.rightPaddle.x,
      gameState.rightPaddle.y,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );

    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, BALL_RADIUS, 0, 2 * Math.PI);
    ctx.fill();

    ctx.font = "32px monospace";
    const barMeasure = ctx.measureText("|");
    ctx.fillText(
      "|",
      (GAME_WIDTH - barMeasure.width) / 2,
      barMeasure.fontBoundingBoxAscent + WALL_WIDTH + SCORE_PADDING_TOP
    );
    ctx.fillText(
      `${gameState.leftPaddle.score}`,
      (GAME_WIDTH - barMeasure.width) / 2 -
        ctx.measureText(`${gameState.leftPaddle.score}`).width -
        SCORE_PADDING_INNER,
      barMeasure.fontBoundingBoxAscent + WALL_WIDTH + SCORE_PADDING_TOP
    );
    ctx.fillText(
      `${gameState.rightPaddle.score}`,
      (GAME_WIDTH - barMeasure.width) / 2 +
        barMeasure.width +
        SCORE_PADDING_INNER,
      barMeasure.fontBoundingBoxAscent + WALL_WIDTH + SCORE_PADDING_TOP
    );
  }

  return { init, cleanup };
})();
