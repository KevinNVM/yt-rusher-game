const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const enemySpawnRate = 1000;
const enemyMaxSpeed = 5;
let projectileSpeed = 10;

let PAUSED = true;

const GRAVITY = 0.3;
const maxSpeed = 10;
const acceleration = 0.5;
const friction = 0.8;
const maxVelocity = 10;
let xAcceleration = 0;

const FULL_RESTORE_CHANCE = 0.0001; // 0.01% chance of full health restoration
const FIFTY_PERCENT_RESTORE_CHANCE = 0.01; // 1% chance of restoring 50% of health
const TWO_POINT_FIVE_PERCENT_RESTORE_CHANCE = 0.5; // 50% chance of restoring 2.5% of health

let baseHealth = 100;
let playerHealth = 100;

let lastProjectileTime = 0;
let projectileCooldown = 500; // in milliseconds

const background = new Rect({
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
  color: "rgba(0, 0, 0, 0.1)",
});

const player = new Player({
  x: canvas.width / 2,
  y: canvas.height / 2,
  velocity: { x: 0, y: 0 },
  width: 50,
  height: 75,
  color: "white",
  helath: 100,
});

const projectiles = [];
const obstacles = [];
const particleSystems = [];
const healthBar = new HealthBar(10, 10, canvas.width - 20, 20, "red");
const score = new Score();
const highestScore = new Score(
  parseInt(localStorage.getItem("highestScore") || "0"),
  20,
  90,
  "Highest Score"
);

// This function is the main function that runs the game.
function main() {
  if (PAUSED) return;
  healthBar.update(playerHealth);

  console.log(score.score);

  // Draws the background image.
  background.draw();

  // Updates the player's position.
  player.update();

  // Applies gravity to the player.
  applyGravity(player);

  // Handles player input (such as moving leftc or right).
  handlePlayerInput(player);

  // Run loops that contain game's logic
  gameFunctionLoop();

  healthBar.draw();

  score.drawScore();
  highestScore.drawScore();
  decreaseHealth(0);
}

function applyGravity(object, gravity) {
  object.velocity.y += gravity || GRAVITY;
  if (object.y + object.height > canvas.height) {
    object.velocity.y = 0;
    object.y = canvas.height - object.height - 1;
  }
}

function handlePlayerInput(player) {
  // Set boundaries
  const leftBoundary = 0;
  const rightBoundary = canvas.width;
  const topBoundary = 0;
  const bottomBoundary = canvas.height;

  if (keyPressed.up && player.y > topBoundary) {
    // player.velocity.y = player.velocity.y == 0 ? -10 : player.velocity.y * 1.04;
    player.velocity.y = Math.max(player.velocity.y - 1, -10);
  }

  if (keyPressed.left && !keyPressed.right && player.x > leftBoundary) {
    xAcceleration = -acceleration;
  } else if (keyPressed.right && !keyPressed.left && player.x < rightBoundary) {
    xAcceleration = acceleration;
  } else {
    xAcceleration = 0;
    player.velocity.x *= friction; // apply friction
  }

  if (Math.abs(player.velocity.x) < maxVelocity) {
    player.velocity.x += xAcceleration;
  }

  // Check if player is out of bounds
  if (player.x < leftBoundary) {
    player.x = leftBoundary;
  }
  if (player.x + player.width > rightBoundary) {
    player.x = rightBoundary - player.width;
  }
  if (player.y < topBoundary) {
    player.y = topBoundary;
  }
  if (player.y > bottomBoundary) {
    player.y = bottomBoundary;
  }
}

function checkOutOfBounds(
  object,
  { onOutOfBounds: onOutOfBounds, shape = "circle" }
) {
  if (!onOutOfBounds || !shape) throw new Error("Missing required parameter");

  switch (shape) {
    case "circle":
      if (
        object.x + object.radius < 0 ||
        object.x - object.radius > canvas.width ||
        object.y + object.radius < 0 ||
        object.y - object.radius > canvas.height
      ) {
        if (typeof onOutOfBounds === "function") {
          onOutOfBounds(true);
          return true;
        }
      } else return false;
      break;

    default:
      if (
        object.x + object.width < 0 ||
        object.x > canvas.width ||
        object.y + object.height < 0 ||
        object.y > canvas.height
      ) {
        if (typeof onOutOfBounds === "function") {
          onOutOfBounds(true);
          return true;
        }
      } else return false;

      break;
  }
}

function createObstacle() {
  setInterval(() => {
    if (PAUSED) return;
    const red = Math.floor(Math.random() * 256); // generates a random value between 0 and 255
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    const color = `rgb(${red}, ${green}, ${blue})`; // creates an RGB color string
    const obstacle = new Obstacle({
      width: 50,
      height: 50,
      color,
      speed: Math.random() * enemyMaxSpeed,
    });
    obstacles.push(obstacle);
  }, enemySpawnRate);
}

function chaseEntity(object1, object2, speed) {
  speed = speed || object1.velocity.x + object1.velocity.y;
  const dx = object1.x - object2.x;
  const dy = object1.y - object2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    const speedX = (dx / distance) * speed;
    const speedY = (dy / distance) * speed;

    object2.velocity.x = speedX;
    object2.velocity.y = speedY;
  }
}

function checkCollision(object1, object2, { onCollide }) {
  if (!onCollide) throw new Error("Missing required parameters");

  const closestX = Math.max(
    object2.x,
    Math.min(object1.x, object2.x + object2.width)
  );
  const closestY = Math.max(
    object2.y,
    Math.min(object1.y, object2.y + object2.height)
  );
  const dx = closestX - object1.x;
  const dy = closestY - object1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= object1.radius) {
    onCollide(true);

    // Create a new particle system and add it to the array.
    const particleSystem = new ParticleSystem({
      x: object1.x,
      y: object1.y,
      numParticles: 20,
      particleSize: 7.5,
      particleSpeed: 2.5,
      color: object2?.color,
    });
    particleSystems.push(particleSystem);
  } else return false;
}

function gameFunctionLoop() {
  // Loops through all the projectiles in the game.
  for (const projectile of projectiles) {
    // Updates the projectile's position.
    projectile.update();

    // Applies gravity to each projectiles
    applyGravity(projectile, 0.09);

    // Removes the projectile if it goes out of bounds.
    checkOutOfBounds(projectile, {
      onOutOfBounds: () => {
        projectiles.splice(projectiles.indexOf(projectile), 1);
      },
    });

    // Loops through all the obstacles in the game.
    for (const obstacle of obstacles) {
      // Checks if the projectile collides with an obstacle.
      if (obstacle) {
        checkCollision(projectile, obstacle, {
          onCollide: () => {
            // Removes the obstacle and the projectile if they collide.
            handleScore(projectile);
            obstacles.splice(obstacles.indexOf(obstacle), 1);
            projectiles.splice(projectiles.indexOf(projectile), 1);
          },
        });
      }
    }
  }

  // Loops through all the particle systems in the game.
  for (let i = particleSystems.length - 1; i >= 0; i--) {
    // Updates the particle system.
    const particleSystem = particleSystems[i];
    particleSystem.update();

    // Draws the particle system.
    particleSystem.draw();

    // Loops through all the particles in the particle system.
    const particles = particleSystem.particles;
    for (let j = 0; j < particles.length; j++) {
      const particle = particles[j];

      // Applies gravity to each particle.
      applyGravity(particle, 0.02);
    }

    // Removes the particle system if it is finished.
    if (particleSystem.isDone()) {
      particleSystems.splice(i, 1);
    }
  }

  // Loops through all the obstacles in the game.
  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];

    // Updates the obstacle's position.
    obstacle.update();

    // Removes the obstacle if it goes out of bounds.
    checkOutOfBounds(obstacle, {
      shape: "rect",
      onOutOfBounds: () => {
        obstacles.splice(i, 1);
        decreaseHealth();
        i--;
      },
    });
  }
}

function createProjectile(mouseEvent) {
  let x, y;
  if (mouseEvent.type === "click") {
    x = mouseEvent.clientX;
    y = mouseEvent.clientY;
  } else if (mouseEvent.type === "touchstart") {
    x = mouseEvent.touches[0].clientX;
    y = mouseEvent.touches[0].clientY;
  }

  const currentTime = Date.now();
  if (currentTime - lastProjectileTime < projectileCooldown) {
    return; // don't spawn a new projectile yet
  }

  // Get the bounding rectangle of the canvas
  const rect = canvas.getBoundingClientRect();
  // Calculate the scaling factor for the canvas
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  // Calculate the mouse coordinates relative to the canvas
  const mouseX = (x - rect.left) * scaleX;
  const mouseY = (y - rect.top) * scaleY;
  // Calculate the angle between the player and the mouse position
  const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
  // Set the speed of the projectile
  const speed = projectileSpeed;
  // Create a new projectile with the player's position, angle, and speed
  const projectile = new Projectile({ x: player.x, y: player.y, angle, speed });
  // Add the new projectile to the projectiles array
  projectiles.push(projectile);

  lastProjectileTime = currentTime; // update the last projectile time
}

function decreaseHealth(number = 10) {
  if (healthBar.currentHealth <= 0) {
    PAUSED = true;
    showDeathScreen();
  } else playerHealth -= number;
}

function gameLoop() {
  main();
  window.requestAnimationFrame(gameLoop);
}

createObstacle();
gameLoop();

// canvas.addEventListener("click", (event) => {
//   const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
//   const speed = 10;
//   const projectile = new Projectile({ x: player.x, y: player.y, angle, speed });
//   projectiles.push(projectile);
// });

// Add a click event listener to the canvas
canvas.addEventListener("click", createProjectile);
canvas.addEventListener("touchstart", createProjectile);

function handleScore(projectile) {
  score.updateScore(
    Math.max(Math.floor(projectile.getDistanceTraveled() / 5), 1)
  );

  if (Math.random() < FULL_RESTORE_CHANCE) {
    playerHealth = baseHealth; // fully restore health
  } else if (
    Math.random() < FIFTY_PERCENT_RESTORE_CHANCE &&
    playerHealth <= baseHealth * 0.5
  ) {
    playerHealth += baseHealth * 0.5; // restore 50% of baseHealth
  } else if (Math.random() < TWO_POINT_FIVE_PERCENT_RESTORE_CHANCE) {
    if (playerHealth < baseHealth) {
      playerHealth += baseHealth * 0.025; // restore 2.5% of baseHealth
    }
  } else if (Math.random() < 0.1) {
    // 10% chance of restoring health
    if (playerHealth < baseHealth) {
      playerHealth += baseHealth * 0.05; // restore 5% of baseHealth
    }
  } else if (Math.random() < 0.2) {
    // 20% chance of restoring health
    if (playerHealth < baseHealth) {
      playerHealth += baseHealth * 0.05; // restore 5% of baseHealth
    }
  }

  if (score.score > highestScore.score) {
    localStorage.setItem("highestScore", score.score);
    highestScore.score = score.score;
  }
}

function gameReset() {
  // Reset player's initial state.
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.velocity.x = 0;
  player.velocity.y = 0;
  playerHealth = baseHealth;
  healthBar.update(playerHealth);

  // Reset obstacles, projectiles, and particle systems.
  obstacles.length = 0;
  projectiles.length = 0;
  particleSystems.length = 0;

  // Reset game state flags.
  PAUSED = false;
  score.score = 0;
  keyPressed.up = false;
  keyPressed.down = false;
  keyPressed.left = false;
  keyPressed.right = false;
}

function getScoreText() {
  return `Score: ${score.score} Highest: ${highestScore.score}`;
}

const btnPlay = document.querySelector("button");
const mainMenu = document.querySelector(".main-menu");
const scoreText = document.querySelector("#score");
const mainMenuText = document.querySelector("h1");
scoreText.innerText = getScoreText();
btnPlay.onclick = () => {
  PAUSED = false;
  gameReset();
  mainMenu.classList.toggle("hidden");
};

function showDeathScreen() {
  mainMenu.classList.toggle("hidden");
  scoreText.innerText = getScoreText();
  mainMenuText.innerText = "RUSHER";
}

function pause() {
  PAUSED = !PAUSED;
  mainMenu.classList.toggle("hidden");
  btnPlay.classList.toggle("hidden");
  scoreText.innerText = getScoreText();
  mainMenuText.innerText = "Paused";
}
