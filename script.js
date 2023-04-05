const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let Paused = false;
const GRAVITY = 0.5;

// Define the base rectangle class
class Rect {
  constructor({ x, y, velocity = null, width, height, color = "white" }) {
    this.x = x;
    this.y = y;
    this.velocity = velocity ?? { x: 0, y: 0 };
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.draw();

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Circle {
  constructor({ x, y, velocity = null, radius, color = "white" }) {
    this.x = x;
    this.y = y;
    this.velocity = velocity ?? { x: 0, y: 0 };
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.draw();

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Projectile extends Circle {
  constructor({ x, y, speed, angle }) {
    const radius = 5;
    const velocity = {
      x: speed * Math.cos(angle),
      y: speed * Math.sin(angle),
    };
    super({ x, y, velocity, radius, color: "red" });
  }
}

class Obstacle extends Rect {
  constructor({ width, height, color = "white", speed }) {
    const x = Math.random() * canvas.width;
    super({ x, y: 0, velocity: { x: 0, y: speed }, width, height, color });
    this.originalWidth = width;
    this.originalHeight = height;
  }

  draw() {
    if (this.width > 0 && this.height > 0) {
      const shrinkFactor =
        1 -
        (this.originalWidth * this.originalHeight - this.width * this.height) /
          (this.originalWidth * this.originalHeight);
      const halfWidth = (this.width / 2) * shrinkFactor;
      const halfHeight = (this.height / 2) * shrinkFactor;
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      ctx.fillStyle = this.color;
      ctx.fillRect(
        centerX - halfWidth,
        centerY - halfHeight,
        this.width * shrinkFactor,
        this.height * shrinkFactor
      );
    }
  }
}

const background = new Rect({
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
  color: "rgba(0, 0, 0, 0.1)",
});

const player = new Rect({
  x: canvas.width / 2,
  y: canvas.height / 2,
  velocity: { x: 0, y: 0 },
  width: 50,
  height: 75,
});

let projectiles = [];
let obstacles = [];

function main() {
  background.draw();
  player.update();
  applyGravity(player);
  handlePlayerInput(player);

  for (const projectile of projectiles) {
    projectile.update();
    applyGravity(projectile, 0.09);
    checkOutOfBounds(projectile, (check) => {
      if (check) projectiles.splice(projectiles.indexOf(projectile), 1);
    });

    for (const obstacle of obstacles) {
      chaseEntity(obstacle, projectile, 10);
      if (checkCollision(projectile, obstacle)) {
        obstacles.splice(obstacles.indexOf(obstacle), 1);
        if (Math.random() * 10 < 9)
          projectiles.splice(projectiles.indexOf(projectile), 1);
      }
    }
  }

  for (const obstacle of obstacles) {
    obstacle.update();
    checkOutOfBounds(obstacle, (check) => {
      if (check) obstacles.splice(obstacles.indexOf(obstacle), 1);
    });
  }

  console.log(projectiles);
}

function applyGravity(object, gravity) {
  object.velocity.y += gravity || GRAVITY;
  if (object.y + object.height > canvas.height) {
    object.velocity.y = 0;
    object.y = canvas.height - object.height - 1;
  }
}

function handlePlayerInput(player) {
  if (keyPressed.up) {
    player.velocity.y = -10;
  }

  if (keyPressed.left) {
    player.velocity.x = -10;
  } else if (keyPressed.right) {
    player.velocity.x = 10;
  } else {
    player.velocity.x = 0;
  }
}

function checkOutOfBounds(object, callback) {
  let check = false;
  if (
    object.x + object.radius < 0 ||
    object.x - object.radius > canvas.width ||
    object.y + object.radius < 0 ||
    object.y - object.radius > canvas.height
  ) {
    check = true;
  } else check = false;
  if (typeof callback === "function") callback(check);
}

function createObstacle() {
  const obstacle = new Obstacle({
    width: 50,
    height: 50,
    color: "blue",
    speed: 2,
  });
  obstacles.push(obstacle);
}

function chaseEntity(object1, object2, speed) {
  speed = speed || object1.velocity.x + object1.velocity.y;
  console.log(speed);
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

function checkCollision(projectile, obstacle) {
  const closestX = Math.max(
    obstacle.x,
    Math.min(projectile.x, obstacle.x + obstacle.width)
  );
  const closestY = Math.max(
    obstacle.y,
    Math.min(projectile.y, obstacle.y + obstacle.height)
  );
  const dx = closestX - projectile.x;
  const dy = closestY - projectile.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= projectile.radius;
}

function gameLoop() {
  if (Paused) return;
  main();
  window.requestAnimationFrame(gameLoop);
}
setInterval(createObstacle, 500); // create a new obstacle every second
gameLoop();

canvas.addEventListener("click", (event) => {
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
  const speed = 10;
  const projectile = new Projectile({ x: player.x, y: player.y, angle, speed });
  projectiles.push(projectile);
});
