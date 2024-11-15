import { toggleFuse, verifyCorrectFuses } from "./firstEnigma.js";
import { displayMessage } from "./message.js";
import { checkAndDisplayMessage } from "./displayEnigmaOnInteraction.js";

import { penalizeTime } from "./pause.js";

import { LightButton } from "./Interactible/LightButton.js";
import { Keyboard } from "./Interactible/Keyboard.js";
import { ImageInteract } from "./Interactible/Image.js";


var code = "";

var lightButton1 = new LightButton("interupter", 'd4054b63-2c4c-4b77-825b-45920778709c');

var interactObjectRef = new Map();
interactObjectRef.set("interupter", new LightButton("interupter", 'd4054b63-2c4c-4b77-825b-45920778709c')) // lie un objet avec un tag
interactObjectRef.set("keyboard", new Keyboard("keyboard", "1234")) 
interactObjectRef.set("image", new ImageInteract("image")) 




export async function interactWithEntity() {
  const target = await SDK3DVerse.engineAPI.castScreenSpaceRay(
    window.innerWidth / 2,
    window.innerHeight / 2
  );
  console.log("target", target);
  if (!target.pickedPosition) return;
  
  const targetUUID = "bc1045d4-0d75-4bd8-9a44-b6a5d5a8aaa0"; 
  await checkAndDisplayMessage(targetUUID, "hmmm... Un fusible semble mort... Essayons de remettre le courant...!", 3000 , 'b9dec695-bd69-4be7-bc6c-6fe215f8bdd3');


  let timeFrame = Date.now(); 

  const entityNametag = getTags(target);
  

  console.log("EUID" , target.entity.getComponent('euid').value);
  console.log("entityNametag", entityNametag);
  
  
  /*temporaire pour démo*/
  
  if(entityNametag[0] === "keypad" || entityNametag[0] === "keyEnter" || entityNametag[0] === "keyClear") 
  {
    entityNametag.reverse();
    entityNametag.push("keyboard");
    entityNametag.reverse();
  }

  if (interactObjectRef.has(entityNametag[0])) 
  {
    interactObjectRef.get(entityNametag[0]).check(entityNametag);
  }
  else
  {
    console.log("Event was not registery in interactObjectRef !");
  }

  switch (entityNametag[0]) 
  {
    case "player":
      console.log("Player entity found");
      break;

    case "fuse":
      toggleFuse(target.entity.getParent(), entityNametag);
      break;

    case "electricBoxButton":
      verifyCorrectFuses();
      break;
  }

  console.log(Date.now() - timeFrame);

}

export function closeImage() {
  const ImgDiv = document.getElementById('image');
  if (ImgDiv) {
    ImgDiv.remove();
    SDK3DVerse.enableInputs();
  }
}

function getTags(target){
  let tags = null;
  if (!target.entity.getComponent('tags')) {
    const parent = target.entity.getAncestors();
    console.log("parent", parent);
    parent.forEach(element => {
      console.log("element", element);
      if (element.getComponent('tags')){
        tags = element.getComponent('tags').value;
      }
    });
  }
  else{
    tags = target.entity.getComponent('tags').value;
  }
  return tags;
}
