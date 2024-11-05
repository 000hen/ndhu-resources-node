import { CompleteMultipartUploadCommand, CreateMultipartUploadCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fileTypeFromBuffer } from "file-type";
import redis from "~/storage/redis.server";

if (!process.env.S3_ENDPOINT) {
    throw new Error("S3_ENDPOINT is required");
}

if (!process.env.S3_ACCESS_KEY_ID) {
    throw new Error("S3_ACCESS_KEY_ID is required");
}

if (!process.env.S3_SECRET_ACCESS_KEY) {
    throw new Error("S3_SECRET_ACCESS_KEY is required");
}

if (!process.env.S3_BUCKET) {
    throw new Error("S3_BUCKET is required");
}

const EXPIRED_IN = 3600;
const REDIS_EXPIRED_IN = 604800;

const bucket = process.env.S3_BUCKET;
const S3 = new S3Client({
    region: "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
});

export async function getResourceMetadata(file: string) {
    return await S3.send(new HeadObjectCommand({
        Bucket: bucket,
        Key: file
    }));
}

export async function getResourceCheckSum(file: string) {
    const metadata = await getResourceMetadata(file);
    return metadata.ChecksumSHA256 || "";
}

export async function getResourceSize(file: string) {
    const size = await redis.get(`s3:${file}:size`);

    if (!size) {
        const metadata = await getResourceMetadata(file);
        await redis.set(`s3:${file}:size`, metadata.ContentLength || 0, { EX: REDIS_EXPIRED_IN });
        
        return Number(metadata.ContentLength || 0);
    }

    return Number(size);
}

export async function getResourceSignedUrl(file: string, filename: string) {
    return await getSignedUrl(S3, new GetObjectCommand({
        Bucket: bucket,
        Key: file,
        ResponseContentDisposition: `attachment; filename="${filename}"`
    }), { expiresIn: EXPIRED_IN });
}

export async function putResourceWithSignedUrl(file: string) {
    return await getSignedUrl(S3, new PutObjectCommand({
        Bucket: bucket,
        Key: file,
    }), { expiresIn: EXPIRED_IN });
}

export async function getResourceMimeType(file: string) {
    const data = await S3.send(new GetObjectCommand({
        Bucket: bucket,
        Key: file,
        Range: "bytes=0-1024"
    }));

    if (!data.Body) {
        throw new Error("Failed to get object body from S3");
    }
    return await fileTypeFromBuffer(await data.Body.transformToByteArray());
}

// Multipart Upload
export async function createResourceMultipartUpload(file: string) {
    return await S3.send(new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: file
    }));
}

export async function uploadResourcePartWithSignedUrl(file: string, partNumber: number, uploadId: string) {
    return await getSignedUrl(S3, new UploadPartCommand({
        Bucket: bucket,
        Key: file,
        PartNumber: partNumber,
        UploadId: uploadId
    }), { expiresIn: EXPIRED_IN });
}

export async function completeResourceMultipartUpload(file: string, uploadId: string, parts: { ETag: string, PartNumber: number }[]) {
    return await S3.send(new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: file,
        UploadId: uploadId,
        MultipartUpload: {
            Parts: parts
        }
    }));
}