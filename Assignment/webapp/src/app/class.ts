import { Student } from './student';

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
