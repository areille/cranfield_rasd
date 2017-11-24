import { Component, OnInit } from '@angular/core';

import { Group } from './group';
import { Class } from './class';
import { Researcher } from './researcher';
import { Student } from './student';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  public classes: Class[] = [];
  public nbClasses = 0;
  public nbStudentPerClass = 0;
  public maxRessourcesPerClass: number;

  ngOnInit(): void {

  }


  /**
   * launchSimulation()
   * Launch a simulation with the parameters
   */
  public launchSimulation() {
    console.log('Simulation started.');
    console.log('Number of classes :');
    console.log(this.nbClasses);
    for (let num = 0; num < this.nbClasses; num++) {
      console.log('Class no : ' + (num + 1));
      let students: Student[] = [];
      const classId = 'c' + (num + 1)

      for (let i = 0; i < this.nbStudentPerClass; i++) {
        const studentId = classId + 's' + (i + 1);
        const newStudent = new Student(studentId, this.maxRessourcesPerClass / this.nbStudentPerClass)
        console.log(newStudent);

        students.push(newStudent);
        console.log(students);
      }
      console.log(students);
      const newClass = new Class(classId, 100, students);
      this.classes.push(newClass);

    }
    console.log('Number of students per class :');
    console.log(this.nbStudentPerClass);
    console.log('Classes');
    console.log(this.classes);
  }
}
