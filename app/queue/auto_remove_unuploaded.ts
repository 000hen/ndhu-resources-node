import Queue from "bull";
import { QueueTask } from "../classes/QueueTask";
import { ProcessData } from "./queue.server";
import db from "~/db/client.server";
import { resources } from "~/db/schema";
import { eq, sql } from "drizzle-orm";

export default class AutoRemoveUnuploaded implements QueueTask {
    async process(
        job: Queue.Job<ProcessData>,
        done: () => void
    ): Promise<void> {
        console.log("[AutoRemove] Start Auto Remove Unuploaded Process");
        console.log(`[AutoRemove] Processing ${job.data.payload.id}`);

        const data = await db
            .select({
                status: resources.state,
            })
            .from(resources)
            .where(eq(resources.id, sql.placeholder("id")))
            .limit(1)
            .prepare()
            .execute({
                id: job.data.payload.id,
            });

        if (!data.length) {
            console.log(
                `[AutoRemove] Resource ${job.data.payload.id} not found, skipping`
            );
            return done();
        }

        const status = data[0].status;
        if (status !== "uploading") {
            console.log(
                `[AutoRemove] Resource ${job.data.payload.id} is not uploading, current status: ${status}, skipping`
            );
            return done();
        }

        await db
            .delete(resources)
            .where(eq(resources.id, sql.placeholder("id")))
            .prepare()
            .execute({
                id: job.data.payload.id,
            });
        
        console.log(`[AutoRemove] Resource ${job.data.payload.id} removed successfully`);
        done();
    }
}
