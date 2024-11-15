import { Interactible } from "./Interatible.js";

import { displayMessage } from "../message.js";
import { penalizeTime } from "../pause.js";


export class Keyboard extends Interactible
{
    code;
    codeEnter = "";

    constructor(_name, _code)
    {
        super(_name);
        this.code = _code;
    }

    async check(_entityNameTag)
    { 
        if (_entityNameTag[1] === "keypad" && this.codeEnter.length < 4)
        {
            this.codeEnter += _entityNameTag[2];
            console.log("code", this.codeEnter);
            displayMessage(this.codeEnter, 2000);
        }
        else if (_entityNameTag[1] === "keyEnter" && this.codeEnter.length === 4)
        {
            this.VerifCode();
        }
        else if (_entityNameTag[1] === "keyClear")
        {
            this.codeEnter = "";
            console.log("code", this.codeEnter);
            displayMessage("Code cleared", 2000);
        }
        
    }

    async VerifCode(){
        if (this.codeEnter === this.code) {
          console.log("Code correct");
          displayMessage("Code correct", 2000);
        }
        else{
            this.codeEnter = "";
            console.log("Code incorrect");
            displayMessage("Code incorrect", 2000);
            displayMessage("-- Penalty of 5 seconds on the timer --", 3000);
            penalizeTime(5);
        }
      }
};
