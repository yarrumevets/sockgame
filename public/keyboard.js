export const generateKeyCapture = () => {
  const keys = {};

  const initKeyboard = () => {
    // Event listeners for key presses.
    document.addEventListener("keydown", (event) => {
      keys[event.key] = true;
    });
    document.addEventListener("keyup", (event) => {
      delete keys[event.key];
    });
  };

  // Getter.
  const getKeys = () => {
    return keys;
  };

  return {
    getKeys,
    initKeyboard,
  };
};
