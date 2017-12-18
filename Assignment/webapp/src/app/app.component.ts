import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs/Rx';

import { Group } from './group';
import { Class } from './class';
import { Researcher } from './researcher';
import { Student } from './student';
import { Job } from './job';
import { Queue } from './queue';

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
   * Array of group. Will contain all groups created by the user.
   */
  public groups: Group[] = [];
  /**
   * The number of classes. Input by the user.
   */
  public nbClasses = 0;
  /**
   * The number of groups. Input by the user.
   */
  public nbGroups = 0;
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
   * 104h : MON 9AM to FRI 5PM
   */
  public availableCoreHS = this.nbCoreS * this.simulationDuration * 104;
  /**
   * Amount of core/hour available for medium jobs.
   */
  public availableCoreHM = this.nbCoreM * this.simulationDuration * 104;
  /**
   * Amount of core/hour available for large jobs.
   */
  public availableCoreHL = this.nbCoreL * this.simulationDuration * 104;

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
  public queueSmall: Queue = new Queue;
  public queueMedium: Queue = new Queue;
  public queueLarge: Queue = new Queue;
  public queueHuge: Queue = new Queue;

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
  public timeToWE = 104;

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

      this.launchTimer();
    }
  }

  public stopSimulation() {
    if (this.sub && this.isSimulationStarted) {
      console.log('Simulation stopped.');
      this.sub.unsubscribe();
      this.classes = [];
      this.groups = [];
      this.isSimulationStarted = false;
    } else {
      console.clear();
      console.log('No simulation running.')
    }
  }

  /**
   * Creates classes with input data.
   */
  public updateNbClasses() {
    let index = 0;
    if (this.nbClasses <= 0) {
      this.nbClasses = 0;
      this.classes = [];
    } else {
      while (!(this.classes.length === this.nbClasses)) {
        index = this.classes.length + 1
        if (this.classes.length < this.nbClasses) {
          const classId = 'c' + index;
          const newClass = new Class(classId);
          this.classes.push(newClass);
        } else {
          this.classes.pop();
        }
      }
    }
    console.log('Classes : '); console.log(this.classes)
  }

  public updateClass(c: Class) {
    let index = 0;
    if (c.nbStudents <= 0) {
      c.nbStudents = 0;
      c.students = [];
    } else {
      while (!(c.students.length === c.nbStudents)) {
        index = c.students.length + 1
        if (c.students.length < c.nbStudents) {
          const studentId = c.uuid + 's' + index;
          const newStudent = new Student(studentId);
          c.students.push(newStudent);
        } else {
          c.students.pop();
        }
      }
    }
    console.log('Classes : '); console.log(this.classes)
  }

  public updateNbGroups() {
    let index = 0;
    if (this.nbGroups <= 0) {
      this.nbGroups = 0;
      this.groups = [];
    } else {
      while (!(this.groups.length === this.nbGroups)) {
        index = this.groups.length + 1
        if (this.groups.length < this.nbGroups) {
          const groupId = 'g' + index;
          const newGroup = new Group(groupId);
          this.groups.push(newGroup);
        } else {
          this.groups.pop();
        }
      }
    }
    console.log('Groups : '); console.log(this.groups)
  }

  public updateGroup(g: Group) {
    let index = 0;
    if (g.nbResearchers <= 0) {
      g.nbResearchers = 0;
      g.researchers = [];
    } else {
      while (!(g.researchers.length === g.nbResearchers)) {
        index = g.researchers.length + 1
        if (g.researchers.length < g.nbResearchers) {
          const researcherId = g.uuid + 'r' + index;
          const newResearcher = new Researcher(researcherId);
          g.researchers.push(newResearcher);
        } else {
          g.researchers.pop();
        }
      }
    }
    console.log('Groups : '); console.log(this.groups)
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

      if (!this.isWeekEnd) {
        this.timeToWE--;
      }

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
      if (this.groups) {
        _.forEach(this.groups, (g: Group) => {
          _.forEach(g.researchers, (r: Researcher) => {
            if (this.testProba(proba)) {
              r.jobs.push(r.submitJob(this.generatesId(), this.nbCorePerNode, this.nbCoreTot));
            }
          });
        });
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
        this.timeToWE = 104;
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
   * - Available time until weekend
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
                  // if (j.cpu < this.availableCoreS) {
                    if (j.runtime < this.timeToWE) {
                      if (!c.ressources) {
                        this.queueSmall.add(j);
                        console.log('Petite queue'); console.log(this.queueSmall);
                        // this.availableCoreHS -= v;
                      } else {
                        if (v < c.ressources) {
                          this.queueSmall.add(j);
                          // this.availableCoreHS -= v;
                        } else {
                          j.status = 'rejected';
                          j.commentary = 'No more ressources for your class (asking :' + v + ', remaining : ' + c.ressources + ')';
                          this.rejectedSmallJobs.push(j);
                        }
                      }
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more time before weekend... Try next week.'
                      this.rejectedSmallJobs.push(j);
                    }
                  // } else {
                  //   j.status = 'rejected';
                  //   j.commentary = 'No more CPU available (asking :' + v + ', available :' + this.availableCoreS + ')';
                  //   this.rejectedSmallJobs.push(j);
                  // }
                  break;
                case ('medium'):
                  // if (j.cpu < this.availableCoreM) {
                    if (j.runtime < this.timeToWE) {
                      if (!c.ressources) {
                        this.queueMedium.add(j);
                        // this.availableCoreM -= j.cpu;
                      } else {
                        if (v < c.ressources) {
                          this.queueMedium.add(j);
                          // this.availableCoreM -= j.cpu;
                        } else {
                          j.status = 'rejected';
                          j.commentary = 'No more ressources for your class (asking :' + v + ', remaining : ' + c.ressources + ')';
                          this.rejectedMediumJobs.push(j);
                        }
                      }
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more time before weekend... Try next week.'
                      this.rejectedMediumJobs.push(j);
                    }
                  // } else {
                  //   j.status = 'rejected';
                  //   j.commentary = 'No more CPU available (asking :' + v + ', available :' + this.availableCoreM + ')';
                  //   this.rejectedMediumJobs.push(j);
                  // }
                  break;
                case ('large'):
                  // if (j.cpu < this.availableCoreL) {
                    if (j.runtime < this.timeToWE) {
                      if (!c.ressources) {
                        this.queueLarge.add(j);
                        // this.availableCoreL -= j.cpu;
                      } else {
                        if (v < c.ressources) {
                          this.queueLarge.add(j);
                          // this.availableCoreL -= j.cpu;
                        } else {
                          j.status = 'rejected';
                          j.commentary = 'No more ressources for your class (asking :' + v + ', remaining : ' + c.ressources + ')';
                          this.rejectedLargeJobs.push(j);
                        }
                      }
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more time before weekend... Try next week.'
                      this.rejectedLargeJobs.push(j);
                    }
                  // } else {
                  //   j.status = 'rejected';
                  //   j.commentary = 'No more CPU available (asking :' + v + ', available :' + this.availableCoreL + ')';
                  //   this.rejectedLargeJobs.push(j);
                  // }
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
    if (this.groups) {
      _.forEach(this.groups, (g: Group) => {
        _.forEach(g.researchers, (r: Researcher) => {
          _.forEach(r.jobs, (j: Job) => {
            const v = j.cpu * j.runtime;
            if (_.isEqual(j.status, 'submitted')) {
              switch (j.type) {
                case ('short'):
                  // if (j.cpu < this.availableCoreS) {
                    if (j.runtime < this.timeToWE) {
                      if (!g.ressources) {
                        this.queueSmall.add(j);
                        // this.availableCoreS -= j.cpu;
                      } else {
                        if (v < g.ressources) {
                          this.queueSmall.add(j);
                          // this.availableCoreS -= j.cpu;
                        } else {
                          j.status = 'rejected';
                          j.commentary = 'No more ressources for your group (asking :' + j.cpu + ', remaining : ' + g.ressources + ')';
                          this.rejectedSmallJobs.push(j);
                        }
                      }
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more time before weekend... Try next week.'
                      this.rejectedSmallJobs.push(j);
                    }
                  // } else {
                  //   j.status = 'rejected';
                  //   j.commentary = 'No more CPU available (asking :' + j.cpu + ', available :' + this.availableCoreS + ')';
                  //   this.rejectedSmallJobs.push(j);
                  // }
                  break;
                case ('medium'):
                  // if (j.cpu < this.availableCoreM) {
                    if (j.runtime < this.timeToWE) {
                      if (!g.ressources) {
                        this.queueMedium.add(j);
                        // this.availableCoreM -= j.cpu;
                      } else {
                        if (v < g.ressources) {
                          this.queueMedium.add(j);
                          // this.availableCoreM -= j.cpu;
                        } else {
                          j.status = 'rejected';
                          j.commentary = 'No more ressources for your group (asking :' + j.cpu + ', remaining : ' + g.ressources + ')';
                          this.rejectedMediumJobs.push(j);
                        }
                      }
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more time before weekend... Try next week.'
                      this.rejectedMediumJobs.push(j);
                    }
                  // } else {
                  //   j.status = 'rejected';
                  //   j.commentary = 'No more CPU available (asking :' + j.cpu + ', available :' + this.availableCoreM + ')';
                  //   this.rejectedMediumJobs.push(j);
                  // }
                  break;
                case ('large'):
                  // if (j.cpu < this.availableCoreL) {
                    if (j.runtime < this.timeToWE) {
                      if (!g.ressources) {
                        this.queueLarge.add(j);
                        // this.availableCoreL -= j.cpu;
                      } else {
                        if (v < g.ressources) {
                          this.queueLarge.add(j);
                          // this.availableCoreL -= j.cpu;
                        } else {
                          j.status = 'rejected';
                          j.commentary = 'No more ressources for your group (asking :' + j.cpu + ', remaining : ' + g.ressources + ')';
                          this.rejectedLargeJobs.push(j);
                        }
                      }
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more time before weekend... Try next week.'
                      this.rejectedLargeJobs.push(j);
                    }
                  // } else {
                  //   j.status = 'rejected';
                  //   j.commentary = 'No more CPU available (asking :' + j.cpu + ', available :' + this.availableCoreL + ')';
                  //   this.rejectedLargeJobs.push(j);
                  // }
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

  public updateQueues(t: number) {
    // update of small queue
    _.forEach(this.queueSmall, (j: Job) => {
      if (_.isEqual(j.status, 'queued')) {
        j.startDate = t;
        j.endDate = t + j.runtime;
        // this.availableCoreS -= j.cpu;
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
