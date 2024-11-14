export function displayMessage(message, duration) {
  const messageElement = document.getElementById("message");
  const textElement = document.createElement("p");
  textElement.textContent = message;
  messageElement.appendChild(textElement);

  setTimeout(() => {
    textElement.classList.add("fade-out");
    setTimeout(() => {
      messageElement.removeChild(textElement);
    }, 500); 
  }, duration);
}
