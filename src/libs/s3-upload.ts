import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/src/libs/s3";

export async function uploadFileToS3(file: File, folder: string = "uploads"): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${Date.now()}-${sanitizedFileName}`;

    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) {
        throw new Error("AWS_S3_BUCKET_NAME environment variable is not defined.");
    }

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    });

    await s3Client.send(command);

    // Return public S3 URL
    const region = process.env.AWS_REGION || "ap-southeast-2";
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}