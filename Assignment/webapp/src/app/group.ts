import { Researcher } from './researcher';

export class Group {
    public groupId: number;
    public groupName: string;
    public ressources: number;
    public researchers: Researcher[];
}
