import { displayMessage } from "../message.js";
import { Interactible } from "./Interatible.js";



export class LightButton extends Interactible
{
  lightUID; // 
  constructor(_name, _lightUID){
    super(_name);
    this.lightUID = _lightUID;
  }

  async check(_entityNameTag)
  {
    console.log(_entityNameTag)
    super.check();
    if (_entityNameTag[1] === "true") {
      console.log("Interupter entity found");
      this.activateDesactivateLight();
    }
    else{
      displayMessage("Mmh.... It seems not be working.", 2000);
      displayMessage("Maybe I should check around.", 2500);
    }
  }


  async activateDesactivateLight(){
    // TODO : Change EUID for light EUID
    const light = await SDK3DVerse.engineAPI.findEntitiesByEUID(this.lightUID);
    console.log("light", light);
    if (light[0].components.point_light.intensity == 10) {
      light[0].setComponent('point_light', { intensity: 2 });
    }
    else{
      light[0].setComponent('point_light', { intensity: 10 });
    }
  }

  
}