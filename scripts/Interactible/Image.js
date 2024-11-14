import { Interactible } from "./Interatible.js";


export class ImageInteract extends Interactible
{
    constructor(_name)
    {
        super(_name);
    }

    async check(_entityNameTag)
    { 
        console.log("Image entity found");
        this.openImage(entityNametag[1]);
    }

    async openImage(_imageName) 
    {
        const imagePath = "../assets/" + _imageName + ".png"
        const ImgDiv = document.createElement('div');
        ImgDiv.id = 'image';
        document.body.appendChild(ImgDiv);
      
        const Img = document.createElement('img');
        Img.src = imagePath;
      
        ImgDiv.innerHTML = '';
        ImgDiv.appendChild(Img);
        ImgDiv.style.display = 'block';
        ImgDiv.style.position = 'absolute';
        ImgDiv.style.top = '50%';
        ImgDiv.style.left = '50%';
        ImgDiv.style.transform = 'translate(-50%, -50%)';
        
        SDK3DVerse.disableInputs();
    }
};
