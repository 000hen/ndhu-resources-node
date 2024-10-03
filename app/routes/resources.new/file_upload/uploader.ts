export async function uploadPart(chunk: Blob, presignedUrl: string) {
    const data = await fetch(presignedUrl, {
        method: "PUT",
        body: chunk,
    });

    return data.headers.get('Etag') ?? '';
}