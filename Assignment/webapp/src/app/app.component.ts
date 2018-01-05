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
   * Number of cores dedicated to huge jobs
   */
  public nbCoreH = this.nbCoreTot;

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
  * Number of cores available for huge jobs. Updated every hour.
  */
  public availableCoreH = this.nbCoreH;

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
  public timeToWeek = 64;
  // week number
  public weeknumber = 1;

  public idCpt = 0;

  /**
  * Number of small jobs performed per week
  */
  public nbSperW: number[] = [];
  public nbMperW: number[] = [];
  public nbLperW: number[] = [];
  public nbHperW: number[] = [];
  public textOutput: String = '-------- SIMULATION RESULTS ------- \n \n';

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

      this.textOutput += 'Simulation duration : ' + this.simulationDuration + '\n\n';
      this.textOutput += 'Number of nodes : ' + this.nbNode + '\n';
      this.textOutput += 'Number of cores : ' + this.nbCorePerNode + '\n';
      this.textOutput += 'Total number of cores : ' + this.nbCoreTot + '\n\n';
      this.textOutput += 'Number of students classes : ' + this.nbClasses + '\n';
      let studentTot = 0;
      _.forEach(this.classes, (c) => {
        studentTot += c.nbStudents;
      });
      this.textOutput += 'Total number of students : ' + studentTot + '\n\n'
      this.textOutput += 'Number of researchers groups : ' + this.nbGroups + '\n';
      let researchersTot = 0;
      _.forEach(this.groups, (g) => {
        researchersTot += g.nbResearchers;
      });
      this.textOutput += 'Total number of researchers : ' + researchersTot + '\n\n';

      this.launchTimer();
    }
  }

  public stopSimulation() {
    if (this.sub && this.isSimulationStarted) {
      console.log('Simulation stopped.');
      this.sub.unsubscribe();
      this.classes = [];
      this.groups = [];
      this.simulationDuration = 1;
      this.nbClasses = 0;
      this.nbGroups = 0;
      // this.isSimulationStarted = false;
      this.output();
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
    this.timer = Observable.timer(2000, 200);
    this.sub = this.timer.subscribe((t) => {

      // Prints out the current time
      // console.log('tick : ' + t + ' hour(s) passed.');
      // const testProb = (1 / this.simulationDuration * 168) * Math.exp(-t / (this.simulationDuration * 168)) * 100;
      // const proba = Math.floor(Math.exp(-2 * t / (this.simulationDuration * 168)) * 50);
      const proba = Math.floor(Math.exp(-2 * t / (168)) * 50);
      // const testProb = Math.exp(-t / 168) * 100;
      // console.log('Testprob :' + proba);
      this.time = t;

      this.updateQueues(t);

      if (!this.isWeekEnd) {
        this.timeToWE--;
      } else {
        this.timeToWeek--;
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
        // console.log(this.classes);
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

      this.checkRessources(t);

      // Update boolean isWeekend (mon.9AM to fri.5PM : 104h)
      if (t % 168 === 104 && t !== 0) {
        this.isWeekEnd = true;
        this.timeToWeek = 64;
        console.log('C\'est le weekend');
      }
      // Update boolean isWeekend (fri.5PM to mon.9AM : 64h + 104h = 168h)
      if (t % 168 === 0 && t !== 0) {
        this.outputWeek(this.weeknumber);
        this.weeknumber++;
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
  }

  /**
   * Checks if submitted jobs can be queued, according to :
   * - Maximum amount of ressources per class chosen by the IT staff,
   * - Available time until weekend
   * - Maximum amount of ressources available on the hpc.
   * If not, the job get the status "rejected".
   */
  public checkRessources(time: number) {
    if (this.classes) {
      _.forEach(this.classes, (c: Class) => {
        _.forEach(c.students, (s: Student) => {
          _.forEach(s.jobs, (j: Job) => {
            const v = j.cpu * j.runtime;
            if (_.isEqual(j.status, 'submitted')) {
              switch (j.type) {
                case ('short'):
                  if (!c.ressources) {
                    this.queueSmall.add(j, time);
                  } else {
                    if (v < c.ressources) {
                      this.queueSmall.add(j, time);
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your class (asking :' + v + ', remaining : ' + c.ressources + ')';
                      this.rejectedSmallJobs.push(j);
                    }
                  }
                  break;
                case ('medium'):
                  if (!c.ressources) {
                    this.queueMedium.add(j, time);
                  } else {
                    if (v < c.ressources) {
                      this.queueMedium.add(j, time);
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your class (asking :' + v + ', remaining : ' + c.ressources + ')';
                      this.rejectedMediumJobs.push(j);
                    }
                  }
                  break;
                case ('large'):
                  if (!c.ressources) {
                    this.queueLarge.add(j, time);
                  } else {
                    if (v < c.ressources) {
                      this.queueLarge.add(j, time);
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your class (asking :' + v + ', remaining : ' + c.ressources + ')';
                      this.rejectedLargeJobs.push(j);
                    }
                  }
                  break;
                case ('huge'):
                  if (!c.ressources) {
                    this.queueHuge.add(j, time);
                  } else {
                    if (v < c.ressources) {
                      this.queueHuge.add(j, time);
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your class (asking :' + v + ', remaining : ' + c.ressources + ')';
                      this.rejectedHugeJobs.push(j);
                    }
                  }
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
                  if (!g.ressources) {
                    this.queueSmall.add(j, time);
                  } else {
                    if (v < g.ressources) {
                      this.queueSmall.add(j, time);
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your group (asking :' + v + ', remaining : ' + g.ressources + ')';
                      this.rejectedSmallJobs.push(j);
                    }
                  }
                  break;
                case ('medium'):
                  if (!g.ressources) {
                    this.queueMedium.add(j, time);
                  } else {
                    if (v < g.ressources) {
                      this.queueMedium.add(j, time);
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your group (asking :' + v + ', remaining : ' + g.ressources + ')';
                      this.rejectedMediumJobs.push(j);
                    }
                  }
                  break;
                case ('large'):
                  if (!g.ressources) {
                    this.queueLarge.add(j, time);
                  } else {
                    if (v < g.ressources) {
                      this.queueLarge.add(j, time);
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your group (asking :' + v + ', remaining : ' + g.ressources + ')';
                      this.rejectedLargeJobs.push(j);
                    }
                  }
                  break;
                case ('huge'):
                  if (!g.ressources) {
                    this.queueHuge.add(j, time);
                  } else {
                    if (v < g.ressources) {
                      this.queueHuge.add(j, time);
                    } else {
                      j.status = 'rejected';
                      j.commentary = 'No more ressources for your group (asking :' + v + ', remaining : ' + g.ressources + ')';
                      this.rejectedHugeJobs.push(j);
                    }
                  }
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

    this.queueSmall.update(this.runningSmallJobs);
    this.queueMedium.update(this.runningMediumJobs);
    this.queueLarge.update(this.runningLargeJobs);
    this.queueHuge.update(this.runningHugeJobs);

    // update of small queue

    // Set queued jobs to running
    _.forEach(this.queueSmall.jobs, (j: Job) => {
      if (_.isEqual(j.status, 'queued') && j.cpu < this.availableCoreS && j.runtime < this.timeToWE) {
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

    // Getting all running jobs
    const runningS = this.queueSmall.removeRunnings();
    // Getting all finished jobs
    const finishedS = _.remove(this.runningSmallJobs, (job: Job) => {
      return _.isEqual(job.status, 'finished');
    });
    this.finishedSmallJobs = _.concat(this.finishedSmallJobs, finishedS);
    this.runningSmallJobs = _.concat(this.runningSmallJobs, runningS);

    // update of medium queue
    _.forEach(this.queueMedium.jobs, (j: Job) => {
      if (_.isEqual(j.status, 'queued') && j.cpu < this.availableCoreM && j.runtime < this.timeToWE) {
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

    const runningM = this.queueMedium.removeRunnings();
    const finishedM = _.remove(this.runningMediumJobs, (job: Job) => {
      return _.isEqual(job.status, 'finished');
    });
    this.finishedMediumJobs = _.concat(this.finishedMediumJobs, finishedM);
    this.runningMediumJobs = _.concat(this.runningMediumJobs, runningM);

    // update of large queue
    _.forEach(this.queueLarge.jobs, (j: Job) => {
      if (_.isEqual(j.status, 'queued') && j.cpu < this.availableCoreL && j.runtime < this.timeToWE) {
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

    const runningL = this.queueLarge.removeRunnings();
    const finishedL = _.remove(this.runningLargeJobs, (job: Job) => {
      return _.isEqual(job.status, 'finished');
    });
    this.runningLargeJobs = _.concat(this.runningLargeJobs, runningL);
    this.finishedLargeJobs = _.concat(this.finishedLargeJobs, finishedL);

    // update of huge queue
    _.forEach(this.queueHuge.jobs, (j: Job) => {
      if (_.isEqual(j.status, 'queued') && j.cpu < this.availableCoreH && this.isWeekEnd && j.runtime < this.timeToWeek) {
        j.startDate = t;
        j.endDate = t + j.runtime;
        this.availableCoreH -= j.cpu;
        j.status = 'running';
      }
    });

    _.forEach(this.runningHugeJobs, (j: Job) => {
      if (t === j.endDate) {
        this.availableCoreH += j.cpu;
        j.status = 'finished';
      }
    });

    const runningH = this.queueHuge.removeRunnings();
    const finishedH = _.remove(this.runningHugeJobs, (job: Job) => {
      return _.isEqual(job.status, 'finished');
    });
    this.runningHugeJobs = _.concat(this.runningHugeJobs, runningH);
    this.finishedHugeJobs = _.concat(this.finishedHugeJobs, finishedH);
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

  public outputWeek(n: number) {
    if (n === 1) {
      this.nbSperW[n - 1] = this.finishedSmallJobs.length;
      this.nbMperW[n - 1] = this.finishedMediumJobs.length;
      this.nbLperW[n - 1] = this.finishedLargeJobs.length;
      this.nbHperW[n - 1] = this.finishedHugeJobs.length;
    } else {
      let val = this.finishedSmallJobs.length - _.sum(this.nbSperW);
      this.nbSperW.push(val);
      val = this.finishedMediumJobs.length - _.sum(this.nbMperW);
      this.nbMperW.push(val);
      val = this.finishedLargeJobs.length - _.sum(this.nbLperW);
      this.nbLperW.push(val);
      val = this.finishedHugeJobs.length - _.sum(this.nbHperW);
      this.nbHperW.push(val);
    }

    this.textOutput += '\n ------- Week ' + n + ' ------- \n\n';

    this.textOutput += 'Amount of small jobs performed : ' + this.nbSperW[n - 1] + '\n';
    this.textOutput += 'Amount of medium jobs performed : ' + this.nbMperW[n - 1] + '\n';
    this.textOutput += 'Amount of large jobs performed : ' + this.nbLperW[n - 1] + '\n';
    this.textOutput += 'Amount of huge jobs performed : ' + this.nbHperW[n - 1] + '\n\n';
  }

  public output() {
    let nbMachineHour = 0;
    const mhs = _.map(this.finishedSmallJobs, (j: Job) => {
      return j.cpu * j.runtime;
    });
    nbMachineHour += _.sum(mhs);
    const mhm = _.map(this.finishedMediumJobs, (j: Job) => {
      return j.cpu * j.runtime;
    });
    nbMachineHour += _.sum(mhm);
    const mhl = _.map(this.finishedLargeJobs, (j: Job) => {
      return j.cpu * j.runtime;
    });
    nbMachineHour += _.sum(mhl);
    const mhh = _.map(this.finishedHugeJobs, (j: Job) => {
      return j.cpu * j.runtime;
    });
    nbMachineHour += _.sum(mhh);

    const averageWaitTimeS = this.calculateAvgWaitTime(this.finishedSmallJobs);
    const averageWaitTimeM = this.calculateAvgWaitTime(this.finishedMediumJobs);
    const averageWaitTimeL = this.calculateAvgWaitTime(this.finishedLargeJobs);
    const averageWaitTimeH = this.calculateAvgWaitTime(this.finishedHugeJobs);

    const averageTurnS = this.calculateAvgTurn(this.finishedSmallJobs);
    const averageTurnM = this.calculateAvgTurn(this.finishedMediumJobs);
    const averageTurnL = this.calculateAvgTurn(this.finishedLargeJobs);
    const averageTurnH = this.calculateAvgTurn(this.finishedHugeJobs);

    this.textOutput += 'Total machine-hour consumed : ' + nbMachineHour + ' h \n';
    this.textOutput += 'Total cost : ' + (nbMachineHour * 25) + ' $ \n\n';
    this.textOutput += '----- Average wait time -----\n\n';
    this.textOutput += 'For a small job : ' + averageWaitTimeS + ' hrs\n'
    this.textOutput += 'For a medium job : ' + averageWaitTimeM + ' hrs\n'
    this.textOutput += 'For a large job : ' + averageWaitTimeL + ' hrs\n'
    this.textOutput += 'For a huge job : ' + averageWaitTimeH + ' hrs\n\n'
    this.textOutput += '----- Average turnaround time ratio -----\n\n';
    this.textOutput += 'For a small job : ' + averageTurnS + '\n'
    this.textOutput += 'For a medium job : ' + averageTurnM + '\n'
    this.textOutput += 'For a large job : ' + averageTurnL + '\n'
    this.textOutput += 'For a huge job : ' + averageTurnH + '\n\n'

  }

  public calculateAvgWaitTime(jobs: Job[]) {
    if (jobs.length === 0) {
      return 'ERR : could not be calculated';
    } else {
      let totalWaitTime = 0;
      _.forEach(jobs, (j) => {
        const waitTime = j.startDate - j.queueDate
        totalWaitTime += waitTime;
      });
      return Math.floor(totalWaitTime / jobs.length);
    }
  }

  public calculateAvgTurn(jobs: Job[]) {
    if (jobs.length === 0) {
      return 'ERR : could not be calculated';
    } else {
      let sum = 0;
      _.forEach(jobs, (j) => {
        const frac = (j.startDate - j.queueDate) / j.runtime;
        sum += frac;
      });
      return Math.floor(sum / jobs.length);
    }
  }
}
