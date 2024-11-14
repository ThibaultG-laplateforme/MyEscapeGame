import { displayMessage } from "./message.js";
import { penalizeTime } from "./pause.js";

export async function toggleFuse(entity,entityNametags) {
  if (entityNametags[2] === "off") {
    entity.setComponent("tags", { value: [entityNametags[0], entityNametags[1], "on"] });
    displayMessage("-- The fuse has been turned on. --", 1500);
  }
  else {
    entity.setComponent("tags", { value: [entityNametags[0], entityNametags[1], "off"] });
    displayMessage("-- The fuse has been turned off. --", 1500);
  }
}

export async function verifyCorrectFuses() 
{
  let allCorrect = true;
  const componentFilter = { mandatoryComponents: ["tags"] };
  const entities = await SDK3DVerse.engineAPI.findEntitiesByComponents(
    componentFilter
  );
  const fuseEntities = entities.filter(
    (entity) => entity.getComponent("tags").value[0] == "fuse"
  );
  const fusesNameTags = fuseEntities.map((entity) => entity.getComponent("tags").value);
  for (let i = 0; i < fusesNameTags.length; i++) {
    if (fusesNameTags[i][1] !== fusesNameTags[i][2]) {
      allCorrect = false;
    }
  }
  if (allCorrect) {
    displayMessage("It worked! The fuses are correctly placed.", 2000);
    switchInterupt()
  }
  else {
    displayMessage("It seems that the fuses are not correctly placed.", 2000);
    displayMessage("I should check again...", 2500);
    displayMessage("-- Penalty of 5 seconds on the timer --", 3000);
    penalizeTime(5);
  }
}

async function switchInterupt() {
  // TODO : Change EUID for interupter EUID
  const interupter = await SDK3DVerse.engineAPI.findEntitiesByEUID(
    "f7af4328-870b-41ce-a3bf-c4b337e11d89"
  );
  console.log("interupter", interupter[0].getComponent("tags").value);
  if (interupter[0].getComponent("tags").value[1] === "true") {
    interupter[0].setComponent("tags", { value: ["interupter", "false"] });
  } else {
    interupter[0].setComponent("tags", { value: ["interupter", "true"] });
  }
}
