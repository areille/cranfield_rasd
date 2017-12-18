import { Job } from './job';

export class Queue {
    public totalRuntime: number;
    public jobs: Job[];

    constructor() {
        this.jobs = [];
        this.totalRuntime = 0;
    }

    public add(job: Job) {
        job.status = 'queued';
        this.totalRuntime += job.runtime;
        this.jobs.push(job);
    }
}
