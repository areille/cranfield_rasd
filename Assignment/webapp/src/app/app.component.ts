import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs/Rx';

import { Group } from './group';
import { Class } from './class';
import { Researcher } from './researcher';
import { Student } from './student';
import { Job } from './job';

import _ from 'lodash';
import { $ } from 'protractor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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
  public nbCoreTot = this.nbCorePerNode * this.nbNode;
  public nbCoreS = Math.floor(this.nbCoreTot * 0.1);
  public nbCoreM = Math.floor(this.nbCoreTot * 0.3);
  public nbCoreL = Math.floor(this.nbCoreTot * 0.5);

  // Number of cores per hour tot
  public nbCoreTotH = this.nbCoreTot * this.simulationDuration * 168;
  public availableCoreHS = this.nbCoreS * this.simulationDuration * 168;
  public availableCoreHM = this.nbCoreM * this.simulationDuration * 168;
  public availableCoreHL = this.nbCoreL * this.simulationDuration * 168;

  public availableCoreS = this.nbCoreS;
  public availableCoreM = this.nbCoreM;
  public availableCoreL = this.nbCoreL;


  public queueSmall: Job[] = [];
  public queueMedium: Job[] = [];
  public queueLarge: Job[] = [];
  public queueHuge: Job[] = [];

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
    if (this.sub) {
      console.log('Simulation stopped.');
      this.sub.unsubscribe();
      this.classes = [];
    } else {
      console.clear();
      console.log('No simulation running.')
    }
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
    this.timer = Observable.timer(2000, 1000);
    this.sub = this.timer.subscribe((t) => {

      // Prints out the current time
      console.log('tick : ' + t + ' hour(s) passed.');


      // Create a job for each student of the first class
      // /!\ Must be done randomly /!\
      if (t === 1) {
        if (this.classes[0]) {
          _.forEach(this.classes[0].students, (s: Student) => {
            const id = 'jobtest' + s.uuid;
            s.jobs = [];
            s.jobs.push(s.defineJob(id, this.nbCorePerNode, this.nbCoreTot));
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
      if (t === 25) {
        this.checkRessources();
      }

      // Update boolean isWeekend (mon.9AM to fri.5PM : 104h)
      if (t % 104 === 0 && t !== 0) {
        this.isWeekEnd = true;
        console.log('C\'est le weekend');
      }
      // Update boolean isWeekend (fri.5PM to mon.9AM : 64h + 104h = 168h)
      if (t % 168 === 0 && t !== 0) {
        this.isWeekEnd = false;
        console.log('C\'est plus le weekend');
      }

      // End of the simulation after the input time (1week : 168h)
      if (t === this.simulationDuration * 168) {
        console.log('End of simulation')
        this.stopSimulation();
      }
    }
    );
  }

  public updateHpcRessources() {

    // Mostly for display
    this.nbCoreTot = this.nbCorePerNode * this.nbNode;
    this.nbCoreS = Math.floor(this.nbCoreTot * 0.1);
    this.nbCoreM = Math.floor(this.nbCoreTot * 0.3);
    this.nbCoreL = Math.floor(this.nbCoreTot * 0.5);
    this.nbCoreTotH = this.nbCoreTot * this.simulationDuration * 168;
  }

  public checkRessources() {
    if (this.classes) {
      _.forEach(this.classes, (c: Class) => {
        _.forEach(c.students, (s: Student) => {
          _.forEach(s.jobs, (j: Job) => {
            const v = j.cpu * j.runtime;
            if (_.isEqual(j.status, 'submitted')) {
              switch (j.type) {
                case ('short'):
                  if (v < this.availableCoreHS) {
                    this.addToQueue(j, this.queueSmall);
                    this.availableCoreHS -= v;
                  } else {
                    j.status = 'rejected';
                  }
                  break;
                case ('medium'):
                  if (v < this.availableCoreHM) {
                    this.addToQueue(j, this.queueMedium);
                    this.availableCoreHM -= v;
                  } else {
                    j.status = 'rejected';
                  }
                  break;
                case ('large'):
                  if (v < this.availableCoreHL) {
                    this.addToQueue(j, this.queueLarge);
                    this.availableCoreHL -= v;
                  } else {
                    j.status = 'rejected';
                  }
                  break;
                case ('huge'):
                  console.log('TODO')
                  j.status = 'rejected'
                  break;
                default:
                  console.log('Internal error (line 195)');
              }
            }
          });
        });
      });
    }
  }

  public addToQueue(job: Job, queue: Job[]) {
    job.status = 'queued';
    queue.push(job);
    console.log(queue);
  }

  public updateQueues() {
    _.forEach(this.queueSmall, (j: Job) => {

    });
    console.log('Queue up to date.')
  }

  public updateRessources() {
    console.log('Ressources up to date.');

  }

  public startJob() {

  }
}
