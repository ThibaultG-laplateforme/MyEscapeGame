import { interactWithEntity, closeImage } from "./interact.js";
import { togglePauseMenu } from "./pause.js";

export function initEventManager(characterController) {
  menuButtonsListeners(characterController);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.getElementById("image")) {
      togglePauseMenu(characterController);
    } else if (event.code === "KeyF" && !document.getElementById("image")) {
      interactWithEntity();
    } else if (event.code === "Escape" && document.getElementById("image")) {
      closeImage();
    }
  });
}

function menuButtonsListeners(characterController) {
  const closeSettingsButtons = [
    document.getElementById("close-settings"),
    document.getElementById("resume-game-pause"),
  ];
  const quitButton = document.getElementById("quit-game");

  closeSettingsButtons.forEach((button) => {
    if (button) {
      button.addEventListener("click", () =>
        togglePauseMenu(characterController)
      );
    } else {
      console.error("Bouton non trouvé");
    }
  });

  if (quitButton) {
    quitButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  } else {
    console.error("Element 'quit-game' not found!");
  }
}
