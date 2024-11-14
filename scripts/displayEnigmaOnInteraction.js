import { displayMessage } from "./message.js";

// Fonction qui vérifie l'interaction avec un objet spécifique par son UUID et déclenche l'animation
export async function checkAndDisplayMessage(targetUUID, message, duration = 3000, animationUUID = 'b9dec695-bd69-4be7-bc6c-6fe215f8bdd3') {
  try {
    // Obtenir la cible via raycasting de la caméra
    const target = await SDK3DVerse.engineAPI.castScreenSpaceRay(
      window.innerWidth / 2,
      window.innerHeight / 2
    );

    // Vérifier si un objet a été détecté
    if (!target || !target.pickedPosition) {
      console.warn("No object picked");
      return;
    }

    // Afficher l'entité pour déboguer
    console.log("Entity:", target.entity);
    console.log("Message to display:", message);

    // Vérifier si l'entité a un composant 'euid'
    const euidComponent = target.entity.getComponent('euid');
    if (!euidComponent) {
      console.warn("Entity does not have an 'euid' component");
      return;
    }

    // Obtenir l'UUID de l'entité détectée
    const entityUUID = euidComponent.value;
    console.log("Entity UUID:", entityUUID);

    // Vérifier si l'UUID correspond à celui attendu
    if (entityUUID === targetUUID) {
      console.log("Target object found");

      // Afficher le message
      displayMessage(message, duration);

      // Déclencher l'animation
      console.log("Triggering animation with UUID:", animationUUID);
      SDK3DVerse.engineAPI.playAnimationSequence(animationUUID)
        .then(() => {
          console.log("Animation started successfully");
        })
        .catch((error) => {
          console.error("Error triggering the animation:", error);
        });
    } else {
      console.log(`Target object UUID (${targetUUID}) does not match picked UUID (${entityUUID})`);
    }
  } catch (error) {
    console.error("Error while checking entity interaction:", error);
  }
}

