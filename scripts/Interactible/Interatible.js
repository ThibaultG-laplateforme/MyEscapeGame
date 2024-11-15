export class Interactible
{
    name;
    
    constructor(_name)
    {
        this.name = _name;
    }

    async check()
    {
        /* Put condition  for all interact object*/
        return true;
    }
}