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
  // ------------ CLASS VARIABLES -------------
  /**
   * Duration of the simulation, in weeks.
   */
  public simulationDuration = 1;

  /**
   * Boolean :
   * - false (default) : no simulation running
   * - true : a simulation is running
   */
  public isSimulationStarted = false;

  /**
   * Array of class. Will contain all classes created by the user.
   */
  public classes: Class[] = [];
  /**
   * The number of classes. Input by the user.
   */
  public nbClasses = 0;
  /**
   * The number of students in each class.
   */
  public nbStudentPerClass = 0;
  /**
   * Ressources allowed per class. In core/hour.
   */
  public maxRessourcesPerClass: number;

  /**
   * Timer.
   */
  private timer;
  /**
   * Subscription to the observable timer.
   */
  private sub: Subscription;
  /**
   * Current time. Expressed in hours. Take the value of the timer.
   * Used for display.
   */
  public time = 0;
  /**
   * Display boolean.
   */
  public showSmallJobs = false;
  /**
   * The number of nodes of the HPC system. Default is 128.
   * Can be modified by the user.
   */
  public nbNode = 128;
  /**
   * The number of core per node. Default is 16.
   * Can be modified by the user.
   */
  public nbCorePerNode = 16;
  /**
   * Total number of core.
   */
  public nbCoreTot = this.nbCorePerNode * this.nbNode;
  /**
   * Number of cores dedicated to small jobs.
   */
  public nbCoreS = Math.floor(this.nbCoreTot * 0.1);
  /**
   * Number of cores dedicated to medium jobs.
   */
  public nbCoreM = Math.floor(this.nbCoreTot * 0.3);
  /**
   * Number of cores dedicated to large jobs.
   */
  public nbCoreL = Math.floor(this.nbCoreTot * 0.5);

  /**
   * Total number of core/hour.
   */
  public nbCoreTotH = this.nbCoreTot * this.simulationDuration * 168;
  /**
   * Amount of core/hour available for small jobs.
   */
  public availableCoreHS = this.nbCoreS * this.simulationDuration * 168;
  /**
   * Amount of core/hour available for medium jobs.
   */
  public availableCoreHM = this.nbCoreM * this.simulationDuration * 168;
  /**
   * Amount of core/hour available for large jobs.
   */
  public availableCoreHL = this.nbCoreL * this.simulationDuration * 168;

  /**
   * Number of cores available for small jobs. Updated every hour.
   */
  public availableCoreS = this.nbCoreS;
  /**
   * Number of cores available for medium jobs. Updated every hour.
   */
  public availableCoreM = this.nbCoreM;
  /**
   * Number of cores available for large jobs. Updated every hour.
   */
  public availableCoreL = this.nbCoreL;

  /**
   * Queue of jobs. Array of jobs having the status "queued".
   */
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

  public rejectedSmallJobs: Job[] = [];
  public rejectedMediumJobs: Job[] = [];
  public rejectedLargeJobs: Job[] = [];
  public rejectedHugeJobs: Job[] = [];

  private isWeekEnd = false;

  public idBase: string[] = [];
  public idCpt = 0;

  ngOnInit(): void {

  }


  /**
   * Launch a simulation with the parameters
   */
  public launchSimulation() {
    if (this.isSimulationStarted) {
      console.log('Already a running simulation.')
    } else {
      console.log('Simulation started.');
      console.log('Monday, 9AM.');
      this.isSimulationStarted = true;
      this.createClasses();

      this.launchTimer();
    }
  }

  public stopSimulation() {
    if (this.sub && this.isSimulationStarted) {
      console.log('Simulation stopped.');
      this.sub.unsubscribe();
      this.classes = [];
      this.isSimulationStarted = false;
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
        const newStudent = new Student(studentId)
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
      // const testProb = (1 / this.simulationDuration * 168) * Math.exp(-t / (this.simulationDuration * 168)) * 100;
      const proba = Math.floor(Math.exp(-2 * t / (this.simulationDuration * 168)) * 50);
      // const testProb = Math.exp(-t / 168) * 100;
      console.log('Testprob :' + proba);
      this.time = t;

      this.updateQueues(t);

      // Create a job for each student of each class, according to the probability

      if (this.classes) {
        _.forEach(this.classes, (c: Class) => {
          _.forEach(c.students, (s: Student) => {
            if (this.testProba(proba)) {
              s.jobs.push(s.submitJob(this.generatesId(), this.nbCorePerNode, this.nbCoreTot));
            }
          });
        });
        console.log(this.classes);
      }

      this.checkRessources();

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

  /**
   * Checks if submitted jobs can be queued, according to :
   * - Maximum amount of ressources per class chosen by the IT staff,
   * - Maximum amount of ressources available on the hpc.
   * If not, the job get the status "rejected".
   */
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
                    if (v < c.ressources) {
                      this.addToQueue(j, this.queueSmall);
                      this.availableCoreHS -= v;
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your class (asking :' + v + ', remaining : ' + c.ressources + ')';
                      this.rejectedSmallJobs.push(j);
                    }
                  } else {
                    j.status = 'rejected';
                    j.commentary = 'No more CPU/h available (asking :' + v + ', available :' + this.availableCoreHS + ')';
                    this.rejectedSmallJobs.push(j);
                  }
                  break;
                case ('medium'):
                  if (v < this.availableCoreHM) {
                    if (v < c.ressources) {
                      this.addToQueue(j, this.queueMedium);
                      this.availableCoreHM -= v;
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your class.'
                      this.rejectedMediumJobs.push(j);
                    }
                  } else {
                    j.status = 'rejected';
                    j.commentary = 'No more CPU/h available (asking :' + v + ', available :' + this.availableCoreHM + ')';
                    this.rejectedMediumJobs.push(j);
                  }
                  break;
                case ('large'):
                  if (v < this.availableCoreHL) {
                    if (v < c.ressources) {
                      this.addToQueue(j, this.queueLarge);
                      this.availableCoreHL -= v;
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your class.'
                      this.rejectedLargeJobs.push(j);
                    }
                  } else {
                    j.status = 'rejected';
                    j.commentary = 'No more CPU/h available (asking :' + v + ', available :' + this.availableCoreHL + ')';
                    this.rejectedLargeJobs.push(j);
                  }
                  break;
                case ('huge'):
                  console.log('TODO')
                  j.status = 'rejected'
                  this.rejectedHugeJobs.push(j);
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

  public updateQueues(t: number) {
    // update of small queue
    _.forEach(this.queueSmall, (j: Job) => {
      if (_.isEqual(j.status, 'queued') && j.cpu < this.availableCoreS && !this.isWeekEnd) {
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
      if (_.isEqual(j.status, 'queued') && j.cpu < this.availableCoreM && !this.isWeekEnd) {
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
      if (_.isEqual(j.status, 'queued') && j.cpu < this.availableCoreL && !this.isWeekEnd) {
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

  /**
   * Returns a boolean according to the input percentage :
   * - true if percentage is 100
   * - false if percentage is 0
   * - true or false if percentage is between 1 and 99
   * @param percentage must be between 0 and 100.
   */
  public testProba(percentage: number) {
    if (percentage === 100) { return true; }
    if (percentage === 0) { return false; }
    if (percentage > 0 && percentage < 100) {
      const value = Math.floor(_.random(1, 99));
      if (value < percentage) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Generates a new id.
   */
  public generatesId() {
    const id = _.padStart(this.idCpt, 8, '0');
    this.idCpt++;
    return id;
  }
}

