import { Component, OnInit } from '@angular/core';

import { Group } from './group';
import { Class } from './class';
import { Researcher } from './researcher';
import { Student } from './student';
import { Subscription, Observable } from 'rxjs/Rx';

import _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  public simulationDuration = 1;

  public classes: Class[] = [];
  public nbClasses = 0;
  public nbStudentPerClass = 0;
  public maxRessourcesPerClass: number;

  private ticks = 0; // value of tick
  private timer;
  private sub: Subscription;

  public nbNode = 128;
  public nbCorePerNode = 16;

  private isWeekEnd = false;

  ngOnInit(): void {

  }


  /**
   * Launch a simulation with the parameters
   */
  public launchSimulation() {
    console.log('Simulation started.');
    console.log('Monday, 9AM.');
    this.createClasses();

    this.launchTimer();
  }

  public stopSimulation() {
    console.log('Simulation stopped.');
    this.sub.unsubscribe();
    this.classes = [];
  }

  /**
   * Creates classes with input data.
   */
  public createClasses() {
    this.classes = [];
    for (let num = 0; num < this.nbClasses; num++) {
      const students: Student[] = [];
      const classId = 'c' + (num + 1)
      for (let i = 0; i < this.nbStudentPerClass; i++) {
        const studentId = classId + 's' + (i + 1);
        const newStudent = new Student(studentId, this.maxRessourcesPerClass / this.nbStudentPerClass)
        students.push(newStudent);
      }
      const newClass = new Class(classId, this.maxRessourcesPerClass, students);
      this.classes.push(newClass);
    }
    console.log(this.classes);
  }

  public launchTimer() {
    this.timer = Observable.timer(2000, 500);
    this.sub = this.timer.subscribe((t) => {

      // Prints out the current time
      console.log('tick : ' + t + ' hour(s) passed.');

      // Create a job for each student of the first class
      if (t === 1) {
        if (this.classes[0]) {
          _.forEach(this.classes[0].students, (s: Student) => {
            const id = 'jobtest' + s.uuid;
            s.jobs = [];
            s.jobs.push(s.defineJob(id));
          });
        }
        console.log(this.classes);
      }

      // Submit all created jobs
      if (t === 20) {
        if (this.classes[0]) {
          _.forEach(this.classes[0].students, (s: Student) => {
            s.submitJobs();
          });
          console.log(this.classes);
        }
      }

      // Update boolean isWeekend
      if (t % 129 === 0 && t !== 0) {
        this.isWeekEnd = true;
        console.log('C\'est le weekend');
      }
      // Update boolean isWeekend
      if (t % 177 === 0 && t !== 0) {
        this.isWeekEnd = false;
        console.log('C\'est plus le weekend');
      }

      // End of the simulation after the input time
      if (t === this.simulationDuration * 168) {
        console.log('End of simulation')
        this.stopSimulation();
      }
    }
    );
  }
}
