import { Job } from './job';
import * as _ from 'lodash';

export class Queue {
    public totalRuntime: number;
    public jobs: Job[];

    constructor() {
        this.jobs = [];
        this.totalRuntime = 0;
    }

    public add(job: Job, addDate: number) {
        job.status = 'queued';
        job.queueDate = addDate;
        this.totalRuntime += job.runtime;
        this.jobs.push(job);
    }

    public update(runningJobs: Job[]) {
        this.totalRuntime -= runningJobs.length;
    }

    public removeRunnings() {
        _.forEach(this.jobs, (j: Job) => {
            if (_.isEqual(j.status, 'running')) {
                this.totalRuntime -= j.runtime;
            }
        });
        const removed = _.remove(this.jobs, (j: Job) => {
            return _.isEqual(j.status, 'running');
        });
        return removed;
    }
}
