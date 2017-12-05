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

  public runningSmallJobs: Job[] = [];
  public runningMediumJobs: Job[] = [];
  public runningLargeJobs: Job[] = [];
  public runningHugeJobs: Job[] = [];

  public finishedSmallJobs: Job[] = [];
  public finishedMediumJobs: Job[] = [];
  public finishedLargeJobs: Job[] = [];
  public finishedHugeJobs: Job[] = [];

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

      this.updateQueues(t);

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
      if (t === 3) {
        if (this.classes[0]) {
          _.forEach(this.classes[0].students, (s: Student) => {
            s.submitJobs();
          });
          console.log(this.classes);
        }
      }
      if (t === 5) {
        this.checkRessources();
      }

      console.log(' ------ Queues : -------');

      console.log('Small queue :');
      console.log(this.queueSmall);
      console.log('Small jobs running :');
      console.log(this.runningSmallJobs);
      console.log('Small jobs finished :');
      console.log(this.finishedSmallJobs);

      console.log('Medium queue :');
      console.log(this.queueMedium);
      console.log('Medium jobs running :');
      console.log(this.runningMediumJobs);
      console.log('Medium jobs finished :');
      console.log(this.finishedMediumJobs);

      console.log('Large queue :');
      console.log(this.queueLarge);
      console.log('Large jobs running :');
      console.log(this.runningLargeJobs);
      console.log('Large jobs finished :');
      console.log(this.finishedLargeJobs);

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
  }

  public updateQueues(t) {
    // update of small queue
    _.forEach(this.queueSmall, (j: Job) => {
      if (_.isEqual(j.status, 'queued') && j.cpu < this.availableCoreS) {
        j.startDate = t;
        j.endDate = t + j.runtime;
        this.availableCoreS -= j.cpu;
        j.status = 'running';
      }
    });
    _.forEach(this.runningSmallJobs, (j: Job) => {
      if (t === j.endDate) {
        this.availableCoreS += j.cpu;
        j.status = 'finished';
      }
    });
    const runningS = _.remove(this.queueSmall, (job: Job) => {
      return _.isEqual(job.status, 'running');
    });
    const finishedS = _.remove(this.runningSmallJobs, (job: Job) => {
      return _.isEqual(job.status, 'finished');
    });
    this.finishedSmallJobs = _.concat(this.finishedSmallJobs, finishedS);
    this.runningSmallJobs = _.concat(this.runningSmallJobs, runningS);

    // update of medium queue
    _.forEach(this.queueMedium, (j: Job) => {
      if (_.isEqual(j.status, 'queued') && j.cpu < this.availableCoreM) {
        j.startDate = t;
        j.endDate = t + j.runtime;
        this.availableCoreM -= j.cpu;
        j.status = 'running';
      }
    });
    _.forEach(this.runningMediumJobs, (j: Job) => {
      if (t === j.endDate) {
        this.availableCoreM += j.cpu;
        j.status = 'finished';
      }
    });
    const runningM = _.remove(this.queueMedium, (job: Job) => {
      return _.isEqual(job.status, 'running');
    });
    const finishedM = _.remove(this.runningMediumJobs, (job: Job) => {
      return _.isEqual(job.status, 'finished');
    });
    this.finishedMediumJobs = _.concat(this.finishedMediumJobs, finishedM);
    this.runningMediumJobs = _.concat(this.runningMediumJobs, runningM);

    // update of large queue
    _.forEach(this.queueLarge, (j: Job) => {
      if (_.isEqual(j.status, 'queued') && j.cpu < this.availableCoreL) {
        j.startDate = t;
        j.endDate = t + j.runtime;
        this.availableCoreL -= j.cpu;
        j.status = 'running';
      }
    });
    _.forEach(this.runningLargeJobs, (j: Job) => {
      if (t === j.endDate) {
        this.availableCoreL += j.cpu;
        j.status = 'finished';
      }
    });
    const runningL = _.remove(this.queueLarge, (job: Job) => {
      return _.isEqual(job.status, 'running');
    });
    const finishedL = _.remove(this.runningLargeJobs, (job: Job) => {
      return _.isEqual(job.status, 'finished');
    });
    this.runningLargeJobs = _.concat(this.runningLargeJobs, runningL);
    this.finishedLargeJobs = _.concat(this.finishedLargeJobs, finishedL);
  }

  public updateRessources() {
    console.log('Ressources up to date.');

  }

  public startJob() {

  }
}
