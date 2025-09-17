import Queue from "bull";
import { ProcessData } from "./queue.server";

export interface QueueTask {
    process(job: Queue.Job<ProcessData>, done: () => void): Promise<void>;
}

export class NotImplementedTask implements QueueTask {
    async process(job: Queue.Job<ProcessData>, done: () => void): Promise<void> {
        console.warn(`Job type ${job.data.type} is not implemented`);
        done();
    }
}