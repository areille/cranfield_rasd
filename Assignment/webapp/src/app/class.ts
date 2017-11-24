import { Student } from './student';
import _ from 'lodash';

export class Class {
    public uuid: String;
    public ressources: number;
    public students: Student[];

    constructor(classId: String, ressources: number, students: Student[] ) {
        this.uuid = classId;
        this.ressources = ressources;
        this.students = students;
    }
}
