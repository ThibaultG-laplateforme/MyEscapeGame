import {
  publicToken,
  mainSceneUUID,
} from "../config.js";

document.addEventListener("DOMContentLoaded", () => {
  clearStorage();

  // Event listener for starting solo session button
  document.getElementById("start-solo").addEventListener("click", () => {
    handleStartSession("solo");
  });

  // Event listener for starting multiplayer session button
  document.getElementById("start-multiplayer").addEventListener("click", () => {
    handleStartSession("multiplayer-host");
  });

  // Event listener for joining multiplayer session button
  document
    .getElementById("join-multiplayer")
    .addEventListener("click", async () => {
      const username = promptUsername();
      if (!username) return;

      const sessionId = prompt("Please enter the session ID to join:");
      if (!sessionId) return;

      try {
        const exists = await checkSession(sessionId);
        if (exists) {
          localStorage.setItem("sessionType", "multiplayer");
          localStorage.setItem("sessionId", sessionId);
          window.location.href = "game.html";
        } else {
          alert("Session not found");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        alert("An error occurred while checking the session.");
      }
    });
});

/** 
 * Clear session type, session id, and username from local storage.
 * 
 * Later I we don't need any local storage item to be stored we can localStorage.clear() to clear all items
 */
function clearStorage() {
  localStorage.removeItem("sessionType");
  localStorage.removeItem("sessionId");
  localStorage.removeItem("username");
}

/**
 * Prompt the user for a username and store it in local storage.
 * @returns {string|null} The entered username or null if no username was entered.
 */
function promptUsername() {
  const username = prompt("Please enter a username to join:");
  if (!username) {
    alert("Enter a username to join the session.");
    return null;
  }
  localStorage.setItem("username", username);
  return username;
}

/**
 * Handle starting a session by prompting for a username and setting session type.
 * @param {string} sessionType - The type of session to start.
 */
function handleStartSession(sessionType) {
  const username = promptUsername();
  if (!username) return;
  localStorage.setItem("sessionType", sessionType);
  window.location.href = "game.html";
}

/**
 * Check if a session with the given session ID exists.
 * @param {string} sessionId - The session ID to check.
 * @returns {Promise<boolean>} A promise that resolves to true if the session exists, false otherwise.
 */
async function checkSession(sessionId) {
  try {
    const sessions = await SDK3DVerse.findSessions({
      userToken: publicToken,
      sceneUUID: mainSceneUUID,
    });
    return sessions.some((session) => session.session_id === sessionId);
  } catch (error) {
    console.error("Error checking session:", error);
    return false;
  }
}

/** 
 * async function checkSession(sessionId) {
  const sessions = await SDK3DVerse.findSessions({
    userToken: publicToken,
    sceneUUID: mainSceneUUID,
  });
  for (const session of sessions) {
    if (session.session_id === sessionId) {
      return true;
    }
  }
  return false;
}*/

