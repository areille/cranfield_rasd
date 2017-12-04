export class Job {
    public uuid: string;
    public type: string;
    public status: string;

    constructor(id: string, type: string, status: string) {
        this.uuid = id;
        this.type = type;
        this.status = status;
    }
}
