//------------------------------------------------------------------------------

import {
  publicToken,
  mainSceneUUID,
  characterControllerSceneUUID,
  spawnPosition,
} from "../config.js";

import { lockPointer } from "./utils.js";
import { broadcastEvent, initServerCommunication } from "./serverCommunication.js";


import {
  initDeviceDetection,
  initControlKeySettings,
  adjustDeviceSensitivity,
} from "./settings.js";

import { initEventManager } from "./eventManager.js";
import { startTimer, Timer, currentTimer } from "./pause.js"

export const SESSION_TYPE = {
  SOLO: "solo",
  MULTIPLAYER_HOST: "multiplayer-host",
  MULTIPLAYER: "multiplayer",
};

const SELECTORS = {
  CANVAS: "display-canvas",
  SESSION_ID_BUTTON: "session-id-button",
  OVERLAY_DIV: "overlay-div",
  ENTER_GAME_BUTTON: "enter-game-button",
  CLIENT_COUNT_TEXT: "client-count-text",
};

//------------------------------------------------------------------------------
window.addEventListener("load", initApp);
const canvas = document.getElementById("display-canvas");
//------------------------------------------------------------------------------
async function initApp() {
  const sessionType = localStorage.getItem("sessionType");

  if (
    sessionType === SESSION_TYPE.SOLO ||
    sessionType === SESSION_TYPE.MULTIPLAYER_HOST
  ) {
    await startSession();
  } else if (sessionType === SESSION_TYPE.MULTIPLAYER) {
    await joinSession(localStorage.getItem("sessionId"));
  }

  if (
    sessionType === SESSION_TYPE.MULTIPLAYER_HOST ||
    sessionType === SESSION_TYPE.MULTIPLAYER
  ) {
    setupMultiplayerUI();
  }

  // To spawn a character controller we need to instantiate the
  // "characterControllerSceneUUID" subscene into our main scene.
  const characterController = await initFirstPersonController(
    characterControllerSceneUUID
  );
  adjustDeviceSensitivity("mouse", characterController);
  canvas.addEventListener("mousedown", lockPointer, { once: true });

  initDeviceDetection(characterController);
  initPointerLockEvents();
  initControlKeySettings();
  handleClientDisconnection();
  initEventManager(characterController);
  initServerCommunication();

  if (sessionType === SESSION_TYPE.SOLO)
  {
    const timer = document.getElementById("timer-container");
    startTimer();
    timer.style.visibility = "visible";
  }
}
//------------------------------------------------------------------------------
async function startSession() {
  const sessionParameters = {
    userToken: publicToken,
    sceneUUID: mainSceneUUID,
    canvas: canvas,
    createDefaultCamera: false,
    startSimulation: "yes",
    showLoadingOverlay: true,
    connectToEditor: true,
  };
  await SDK3DVerse.startSession(sessionParameters);
}

async function joinSession(sessionId) {
  if (sessionId) {
    const sessionParameters = {
      sessionId: sessionId,
      userToken: publicToken,
      canvas: canvas,
      createDefaultCamera: false,
      connectToEditor: true,
    };
    await SDK3DVerse.joinSession(sessionParameters);
  }
}
//------------------------------------------------------------------------------
let overlayDiv;
function setupMultiplayerUI() {
  const sessionIdButton = document.getElementById(SELECTORS.SESSION_ID_BUTTON);
  SDK3DVerse.disableInputs();
  sessionIdButton.style.visibility = "visible";
  canvas.style.visibility = "hidden";

  overlayDiv = createOverlayDiv();
  document.body.appendChild(overlayDiv);

  const enterGameButton = createEnterGameButton();
  overlayDiv.appendChild(enterGameButton);

  const clientCountText = createClientCountText();
  overlayDiv.appendChild(clientCountText);

  const usernamesDiv = createUsernamesRectangle();
  overlayDiv.appendChild(usernamesDiv);

  let keepChecking = true;
  async function checkClientUUIDs() {
    while (keepChecking) {
      const clientUUIDs = await SDK3DVerse.getClientUUIDs();
      clientCountText.innerText = `${clientUUIDs.length} / 3 clients connected`;

      const componentFilter = { mandatoryComponents: ["tags"] };
      const entities = await SDK3DVerse.engineAPI.findEntitiesByComponents(
        componentFilter
      );
      const playerEntities = entities.filter(
        (entity) => entity.getComponent("tags").value == "player"
      );

      updateUsernamesRectangle(usernamesDiv, playerEntities);

      if (clientUUIDs.length === 2) {
        enterGameButton.style.display = "block";
      }
      else { enterGameButton.style.display = "none"; }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  enterGameButton.addEventListener("click",  async () => {
    keepChecking = false;
    console.log("Emitting startTimer event from client main");
    broadcastEvent("startGame");    
  });

  checkClientUUIDs();
}

export function startGame() {
  console.log("startGame function called");
  canvas.style.visibility = "visible";
  SDK3DVerse.enableInputs();
  document.body.removeChild(overlayDiv);
  const timer = document.getElementById("timer-container");
  timer.style.visibility = "visible";
  startTimer();
}

function createOverlayDiv() {
  const overlayDiv = document.createElement("div");
  overlayDiv.id = SELECTORS.OVERLAY_DIV;
  return overlayDiv;
}

function createEnterGameButton() {
  const enterGameButton = document.createElement("button");
  enterGameButton.id = SELECTORS.ENTER_GAME_BUTTON;
  enterGameButton.innerText = "Enter Game";
  return enterGameButton;
}

function createClientCountText() {
  const clientCountText = document.createElement("p");
  clientCountText.id = SELECTORS.CLIENT_COUNT_TEXT;
  clientCountText.innerText = "0 / 3 players joined";
  return clientCountText;
}

function createUsernamesRectangle() {
  const usernamesDiv = document.createElement("div");
  usernamesDiv.id = "usernames-rectangle";
  usernamesDiv.style.position = "absolute";
  usernamesDiv.style.top = "10px";
  usernamesDiv.style.left = "10px";
  usernamesDiv.style.padding = "10px";
  usernamesDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  usernamesDiv.style.color = "white";
  usernamesDiv.style.borderRadius = "5px";
  usernamesDiv.style.zIndex = "2";
  return usernamesDiv;
}

function updateUsernamesRectangle(usernamesDiv, playerEntities) {
  usernamesDiv.innerHTML = "";
  playerEntities.forEach((playerEntity) => {
    const username = playerEntity.getParent().getParent().getName();
    const usernameElement = document.createElement("p");
    usernameElement.style.textAlign = "center";
    usernameElement.innerText = username;
    usernamesDiv.appendChild(usernameElement);
  });
}

//------------------------------------------------------------------------------
async function initFirstPersonController(charCtlSceneUUID) {
  // To spawn an entity we need to create an EntityTemplate and specify the
  // components we want to attach to it. In this case we only want a scene_ref
  // that points to the character controller scene.
  const playerTemplate = new SDK3DVerse.EntityTemplate();
  playerTemplate.attachComponent("scene_ref", { value: charCtlSceneUUID });
  playerTemplate.attachComponent("local_transform", {
    position: spawnPosition,
  });
  // Passing null as parent entity will instantiate our new entity at the root
  // of the main scene.
  const parentEntity = null;
  // Setting this option to true will ensure that our entity will be destroyed
  // when the client is disconnected from the session, making sure we don't
  // leave our 'dead' player body behind.
  const deleteOnClientDisconnection = true;
  // We don't want the player to be saved forever in the scene, so we
  // instantiate a transient entity.
  // Note that an entity template can be instantiated multiple times.
  // Each instantiation results in a new entity.
  const username = localStorage.getItem("username");
  const playerSceneEntity = await playerTemplate.instantiateTransientEntity(
    username,
    parentEntity,
    deleteOnClientDisconnection
  );

  // The character controller scene is setup as having a single entity at its
  // root which is the first person controller itself.
  const firstPersonController = (await playerSceneEntity.getChildren())[0];
  // Look for the first person camera in the children of the controller.
  const children = await firstPersonController.getChildren();
  const firstPersonCamera = children.find((child) =>
    child.isAttached("camera")
  );

  // We need to assign the current client to the first person controller
  // script which is attached to the firstPersonController entity.
  // This allows the script to know which client inputs it should read.
  SDK3DVerse.engineAPI.assignClientToScripts(firstPersonController);

  // Finally set the first person camera as the main camera.
  await SDK3DVerse.setMainCamera(firstPersonCamera);

  return firstPersonController;
}

//------------------------------------------------------------------------------
function handleClientDisconnection() {
  // Users are considered inactive after 5 minutes of inactivity and are
  // kicked after 30 seconds of inactivity. Setting an inactivity callback
  // with a 30 seconds cooldown allows us to open a popup when the user gets
  // disconnected.
  SDK3DVerse.setInactivityCallback(showInactivityPopup);

  // The following does the same but in case the disconnection is
  // requested by the server.
  SDK3DVerse.notifier.on("onConnectionClosed", showDisconnectedPopup);
}

//------------------------------------------------------------------------------
function showInactivityPopup() {
  document
    .getElementById("resume")
    .addEventListener("click", closeInactivityPopup);
  document
    .getElementById("inactivity-modal")
    .parentNode.classList.add("active");
}

//------------------------------------------------------------------------------
function closeInactivityPopup() {
  document
    .getElementById("resume")
    .removeEventListener("click", closeInactivityPopup);
  document
    .getElementById("inactivity-modal")
    .parentNode.classList.remove("active");
}
//------------------------------------------------------------------------------
document
  .getElementById("session-id-button")
  .addEventListener("click", showSessionIdPopup);
function showSessionIdPopup() {
  const sessionId = SDK3DVerse.getSessionId();
  const sessionIdParagraph = document.querySelector("#session-id-modal p");
  sessionIdParagraph.textContent = sessionId;
  document
    .getElementById("close-session-id")
    .addEventListener("click", closeSessionIdPopup);
  document
    .getElementById("session-id-modal")
    .parentNode.classList.add("active");
}

//------------------------------------------------------------------------------
function closeSessionIdPopup() {
  document
    .getElementById("close-session-id")
    .removeEventListener("click", closeSessionIdPopup);
  document
    .getElementById("session-id-modal")
    .parentNode.classList.remove("active");
}

//------------------------------------------------------------------------------
function showDisconnectedPopup() {
  document
    .getElementById("reload-session")
    .addEventListener("click", () => window.location.reload());
  document
    .getElementById("disconnected-modal")
    .parentNode.classList.add("active");
}

//------------------------------------------------------------------------------
function initPointerLockEvents() {
  // Web browsers have a safety mechanism preventing the pointerlock to be
  // instantly requested after being naturally exited, if the user tries to
  // relock the pointer too quickly, we wait a second before requesting
  // pointer lock again.
  document.addEventListener("pointerlockerror", async () => {
    if (document.pointerLockElement === null) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await lockPointer();
    }
  });
}