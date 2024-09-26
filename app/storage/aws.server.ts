import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
    const metadata = await getResourceMetadata(file);
    return Number(metadata.ContentLength || 0);
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
        Key: file
    }), { expiresIn: EXPIRED_IN });
}