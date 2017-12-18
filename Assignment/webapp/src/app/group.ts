import { Researcher } from './researcher';

export class Group {
    public uuid: String;
    public ressources?: number;
    public nbResearchers: number;
    public researchers: Researcher[];

    constructor(groupId: String) {
        this.uuid = groupId;
        this.nbResearchers = 0;
        this.researchers = [];
    }
}
