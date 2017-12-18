import * as _ from 'lodash';
import { Job } from './job';

export class Researcher {
    public uuid: String;
    public jobs: Job[];
    public additionnalRessources?: number;

    /**
     * Creates a job and submits it.
     * @param jobId The id of the job
     * @param nbCorePerNode Number of cores per node. Used to set a random job cpu value.
     * @param nbCore Number of cores of the system. Used to set a random job cpu value.
     */
    public submitJob(jobId: string, nbCorePerNode: number, nbCore: number) {
        const rand = _.random(0, 100);
        let jobType = 1;
        if (rand > 40) { // between 40 and 100 : 60% chance
            jobType = 1;
        } else if (rand > 10) { // between 10 and 40 : 30% chance
            jobType = 2
        } else if (rand > 3) { // between 3 and 10 : 7% chance
            jobType = 3;
        } else {     // Between 0 and 3 : 3% chance
            jobType = 4;
        }
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
        const job = new Job(jobId, type, 'submitted', cpu, runtime);
        return job;
    }


    constructor(id: String) {
        this.uuid = id;
        this.jobs = [];
    }
}
