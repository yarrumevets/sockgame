const rectRectCollisionCheck = (rect1, rect2) => {
  if (
    rect1.x1 > rect2.x2 ||
    rect2.x1 > rect1.x2 ||
    rect1.y1 > rect2.y2 ||
    rect2.y1 > rect1.y2
  ) {
    return false;
  }
  return true;
};

// Create a world-coordinates rectangle based on the game object position and the offset of the hitbox.
const rectfromGameObject = (gameObj) => {
  const rect = {
    x1: gameObj.x,
    y1: gameObj.y,
  };
  rect.x2 = rect.x1 + gameObj.width;
  rect.y2 = rect.y1 + gameObj.height;
  return rect;
};

module.exports = { rectRectCollisionCheck, rectfromGameObject };
