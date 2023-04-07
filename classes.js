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
    this.distanceTraveled = 0;
  }

  update() {
    super.update();
    this.distanceTraveled += Math.sqrt(
      Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)
    );
  }

  getDistanceTraveled(round = true) {
    if (!round) return this.distanceTraveled;
    return Math.floor(this.distanceTraveled / 10);
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

class ParticleSystem {
  constructor({
    x,
    y,
    numParticles = 200,
    particleSize = 5,
    particleSpeed = 5,
    color = "white",
  }) {
    this.particles = [];
    this.particlesCount = 0;
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const xVelocity = Math.cos(angle) * particleSpeed;
      const yVelocity = Math.sin(angle) * particleSpeed;
      const particle = new Circle({
        x,
        y,
        velocity: { x: xVelocity, y: yVelocity },
        radius: particleSize,
        color,
      });
      this.particles.push(particle);
    }
  }

  update() {
    for (const particle of this.particles) {
      particle.update();
      checkOutOfBounds(particle, {
        onOutOfBounds: () =>
          this.particles.slice(this.particles.indexOf(particle), 1),
      });
    }
  }

  draw() {
    this.particlesCount = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      particle.draw();
      this.particlesCount++;
    }
  }

  isDone() {
    return this.particles.every((particle) => particle.velocity.y >= 0);
  }

  getParticlesCount() {
    return this.particlesCount;
  }
}

class HealthBar {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.maxHealth = 100;
    this.currentHealth = 100;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    const healthWidth = this.width * (this.currentHealth / this.maxHealth);
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y, healthWidth, this.height);
  }

  update(health) {
    this.currentHealth = health;
  }
}

class Player extends Rect {
  constructor({ x, y, velocity, width, height, color, health }) {
    super({ x, y, velocity, width, height, color });
    this.health = health;
    this.maxHealth = health;
    this.healthBarWidth = this.width;
    this.healthBarHeight = 5;
    this.healthBarColor = "green";
  }

  update() {
    super.update();
    this.drawHealthBar();
  }

  drawHealthBar() {
    const x = this.x;
    const y = this.y - 10;
    const width = (this.health / this.maxHealth) * this.healthBarWidth;
    const height = this.healthBarHeight;

    ctx.fillStyle = this.healthBarColor;
    ctx.fillRect(x, y, width, height);
  }
}

class Score {
  constructor(baseScore = 0, x = 20, y = 60, text = null) {
    this.x = x;
    this.y = y;
    this.score = baseScore;
    this.text = text || "Score :";
  }

  updateScore(score = 1) {
    this.score += score;
  }

  drawScore() {
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`${this.text} ${this.score}`, this.x, this.y);
  }
}
