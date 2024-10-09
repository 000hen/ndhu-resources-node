import Queue from "bull";
import { ProcessData, ProcessType, queue } from "./queue.server";
import db from "~/db/client.server";
import { resourceReviewer, resources } from "~/db/schema";
import { eq, sql } from "drizzle-orm";
import { getResourceMimeType } from "~/storage/aws.server";
import { isMimeSafe } from "~/utils";

export default async function handler(job: Queue.Job<ProcessData>) {
    if (job.data.type !== ProcessType.AutoReview)
        return;

    console.log("[Autoreviewer] Start Auto Review Process");
    console.log(`[Autoreviewer] Processing ${job.data.payload.id}`);

    const data = await db
        .select({
            storageFilename: resources.storageFilename,
        })
        .from(resources)
        .where(eq(resources.id, sql.placeholder("id")))
        .limit(1)
        .prepare()
        .execute({
            id: job.data.payload.id
        });
    
    if (!data.length)
        return;

    const storageFilename = data[0].storageFilename;
    const mime = await getResourceMimeType(storageFilename);
    const isSafity = isMimeSafe(mime?.mime || "");

    console.log(`[Autoreviewer] Resource ${job.data.payload.id} mimetype: ${mime?.mime} (${isSafity ? "safe" : "unsafe"})`);
    
    if (isSafity) {
        await Promise.all([
            db
                .update(resources)
                .set({
                    state: "approved"
                })
                .where(eq(resources.id, sql.placeholder("id")))
                .prepare()
                .execute({
                    id: job.data.payload.id
                }),
            db
                .insert(resourceReviewer)
                .values({
                    resource: sql.placeholder("resource"),
                    reason: "state.autoreview.approved",
                    state: "approved"
                })
                .prepare()
                .execute({
                    resource: job.data.payload.id
                })
        ]);
    } else {
        await db
            .insert(resourceReviewer)
            .values({
                resource: sql.placeholder("resource"),
                reason: "state.autoreview.adminreview",
                state: "pending"
            });
        
        queue.add({
            type: ProcessType.NotifyAdminReview,
            payload: {
                id: job.data.payload.id
            }
        });
    }

    console.log(`[Autoreviewer] Resource ${job.data.payload.id} processed`);
}