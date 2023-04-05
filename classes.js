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
  }
}
