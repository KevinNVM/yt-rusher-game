const keyPressed = {
  up: false,
  down: false,
  left: false,
  right: false,
};

window.onkeydown = (e) => {
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
