import Queue from "bull";
import autoReviewerHandler from "./autoreviewer.server";

export enum ProcessType {
    AutoReview,
    NotifyAdminReview,
    NoyifyAdminReport,
    UnuploadDataRemoval
}

export type ProcessData =
    | { type: ProcessType.AutoReview, payload: { id: number } }
    | { type: ProcessType.NotifyAdminReview, payload: { id: number } }
    | { type: ProcessType.NoyifyAdminReport, payload: { id: number } }
    | { type: ProcessType.UnuploadDataRemoval, payload: { id: number } };

export const queue = new Queue<ProcessData>("default", {
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        username: process.env.REDIS_USER || undefined,
        password: process.env.REDIS_PASS || undefined,
        db: Number(process.env.REDIS_DB) || 0,
    },
});

export type JobFunction = (job: Queue.Job<ProcessData>, done: () => void) => void;
type JobsInterface = {
    [key in ProcessType]: JobFunction;
};

// TODO: Add the rest of the jobs
const JOBS: JobsInterface = {
    [ProcessType.AutoReview]: autoReviewerHandler,
    [ProcessType.NotifyAdminReview]: (job, done) => {
        done();
    },
    [ProcessType.NoyifyAdminReport]: (job, done) => {
        done();
    },
    [ProcessType.UnuploadDataRemoval]: (job, done) => {
        done();
    },
}

// Process the queue
queue.process(async (job, done) => JOBS[job.data.type](job, done));
queue.on("error", (error) => {
    console.error(error);
});

queue.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

queue.on("failed", (job, error) => {
    console.error(`Job ${job.id} failed: ${error.message}`);
});
// TODO: Add functionality to handle the queue