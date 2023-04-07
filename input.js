const keyPressed = {
  up: false,
  down: false,
  left: false,
  right: false,
};

window.onkeydown = (e) => {
  if (e.key === "Escape") pause();

  switch (e.key.toLowerCase()) {
    case "w":
      keyPressed.up = true;
      break;
    case "s":
      keyPressed.down = true;
      break;
    case "a":
      keyPressed.left = true;
      break;
    case "d":
      keyPressed.right = true;
      break;
  }
};

window.onkeyup = (e) => {
  switch (e.key.toLowerCase()) {
    case "w":
      keyPressed.up = false;
      break;
    case "s":
      keyPressed.down = false;
      break;
    case "a":
      keyPressed.left = false;
      break;
    case "d":
      keyPressed.right = false;
      break;
  }
};

// Touch Controls
const upBtn = document.getElementById("up-btn");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

upBtn.addEventListener("touchstart", () => (keyPressed.up = true));
upBtn.addEventListener("touchend", () => (keyPressed.up = false));
leftBtn.addEventListener("touchstart", () => (keyPressed.left = true));
leftBtn.addEventListener("touchend", () => (keyPressed.left = false));

rightBtn.addEventListener("touchstart", () => (keyPressed.right = true));
rightBtn.addEventListener("touchend", () => (keyPressed.right = false));

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") {
    if (!PAUSED) pause();
  }
});
