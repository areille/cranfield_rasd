import * as _ from 'lodash';
import { Job } from './job';

export class Student {
    public uuid: String;
    public ressources: number;
    public jobs: Job[];

    public defineJob(jobId: string) {
        const jobType = _.random(1, 4);
        let type = '';
        switch (jobType) {
            case (1):
                type = 'short';
                break;
            case (2):
                type = 'medium';
                break;
            case (3):
                type = 'large';
                break;
            case (4):
                type = 'huge';
                break;
            default:
                console.log('Internal system error...');
        }
        const job = new Job(jobId, type, 'created');
        return job;
    }

    public submitJobs() {
        if (this.jobs) {
            _.forEach(this.jobs, (j) => {
                if (_.isEqual(j.status, 'created')) {
                    j.status = 'submitted';
                }
            })
        } else {
            console.log('No job to submit.')
        }
    }

    constructor(id: String, ressources: number) {
        this.uuid = id;
        this.ressources = ressources;
    }
}
