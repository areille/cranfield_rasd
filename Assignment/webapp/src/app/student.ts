export class Student {
    public uuid: String;
    public ressources: number;

    constructor(id: String, ressources: number) {
        this.uuid = id;
        this.ressources = ressources;
    }
}
