import { ActionFunctionArgs, json } from "@remix-run/node";
import { Premission } from "~/utils";
import { AuthedInfo, createServerValidation, getAuthInfoWithPremission, redirectToLogin, validateServerValidation } from "~/utils.server";
import { ClientActionType, RequestPreSignedPUT, RequestUploadDone, ServerAction, ServerActionType } from "./types";
import { UploadResourceInterface } from "~/types/resource";
import db from "~/db/client.server";
import { resources } from "~/db/schema";
import { eq, sql } from "drizzle-orm";
import { completeResourceMultipartUpload, createResourceMultipartUpload, uploadResourcePartWithSignedUrl } from "~/storage/aws.server";

export async function action({ request, context }: ActionFunctionArgs) {
    const auth = await getAuthInfoWithPremission({ request, context });
    if (!auth.auth)
        return redirectToLogin(request);

    if (auth.premission < Premission.VerifiedUser)
        return null;

    const formData = await request.formData();
    const action = Number(formData.get("type") || 0) as ClientActionType;
    const payload = JSON.parse(formData.get("payload") as string || "{}") as object;

    switch (action) {
        case ClientActionType.RequestUpload:
            return json(handleRequestUpload(payload, auth));
        case ClientActionType.RequestPreSignedPUT:
            return json(handlePreSigned(payload));
        case ClientActionType.RequestUploadDone:
            return json(handleUploadSuccess(payload));
    }
}

async function handleRequestUpload(payload: object, user: AuthedInfo): Promise<ServerAction> {
    const data = payload as UploadResourceInterface;

    const response = await db
        .insert(resources)
        .values({
            name: data.name,
            description: data.description,
            courses: data.course?.id,
            tags: data.tags,
            upload_by: user.id,
            type: data.category,
            filename: data.filename,
        })
        .$returningId();
    
    const file = await db
        .select({
            filename: resources.filename,
        })
        .from(resources)
        .where(eq(resources.id, sql.placeholder('id')))
        .prepare()
        .execute({ id: response[0] });
    
    const storageFilename = file[0].filename;
    const s3Multipart = await createResourceMultipartUpload(storageFilename);

    const signature = createServerValidation(s3Multipart.UploadId + "&" + storageFilename);
    
    return {
        type: ServerActionType.ServerUploadResponse,
        payload: {
            resourceid: response[0].id,
            uploadid: s3Multipart.UploadId || "",
            fileid: storageFilename,
            validate: signature
        }
    }
}

async function handlePreSigned(payload: object): Promise<ServerAction | null> {
    const data = payload as RequestPreSignedPUT;
    if (!validateServerValidation(data.uploadid + "&" + data.fileid, data.validate))
        return null;

    const preSigned = await uploadResourcePartWithSignedUrl(data.fileid, data.part, data.uploadid);

    return {
        type: ServerActionType.ServerPreSignedPUT,
        payload: {
            url: preSigned
        }
    };
}

async function handleUploadSuccess(payload: object): Promise<ServerAction | null> {
    const data = payload as RequestUploadDone;
    if (!validateServerValidation(data.uploadid + "&" + data.fileid, data.validate))
        return null;

    await completeResourceMultipartUpload(data.fileid, data.uploadid, data.parts);
    await db
        .update(resources)
        .set({
            state: "pending"
        })
        .where(eq(resources.id, sql.placeholder('id')))
        .prepare()
        .execute({ id: data.resourceid });

    return {
        type: ServerActionType.ServerUploadDone
    };
}
