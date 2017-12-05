import * as _ from 'lodash';
import { Job } from './job';

export class Student {
    public uuid: String;
    public ressources: number;
    public jobs: Job[];

    public defineJob(jobId: string, nbCorePerNode: number, nbCore: number) {
        const jobType = _.random(1, 4);
        let type = '';
        let cpu = 0;
        let runtime = 0;
        switch (jobType) {
            case (1):
                type = 'short';
                cpu = _.random(1, 2 * nbCorePerNode); // from 1 to 2 node => 1 core to 2*nbCorePerNode
                runtime = 1;
                break;
            case (2):
                type = 'medium';
                cpu = _.random(2 * nbCorePerNode, Math.floor(nbCore * 0.1));
                runtime = _.random(2, 8);
                break;
            case (3):
                type = 'large';
                cpu = _.random(Math.floor(nbCore * 0.1), Math.floor(nbCore * 0.5));
                runtime = _.random(9, 16);
                break;
            case (4):
                type = 'huge';
                cpu = _.random(Math.floor(nbCore * 0.5), nbCore);
                runtime = _.random(16, 64);
                break;
            default:
                console.log('Internal system error...');
        }
        const job = new Job(jobId, type, 'created', cpu, runtime);
        return job;
    }

    public submitJobs() {
        if (this.jobs) {
            _.forEach(this.jobs, (j) => {
                if (_.isEqual(j.status, 'created')) {
                    j.status = 'submitted';
                }
            });
        } else {
            console.log('No job to submit.')
        }
    }

    constructor(id: String, ressources: number) {
        this.uuid = id;
        this.ressources = ressources;
        this.jobs = [];
    }
}
