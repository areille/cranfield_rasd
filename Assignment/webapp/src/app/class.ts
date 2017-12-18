import { Student } from './student';
import _ from 'lodash';

export class Class {
    public uuid: String;
    public ressources?: number;
    public nbStudents: number;
    public students: Student[];

    constructor(classId: String) {
        this.uuid = classId;
        this.nbStudents = 0;
        this.students = [];
    }
}
