import {S3Client} from "@aws-sdk/client-s3";

// Ensure required environment variables are present before initializing
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Missing AWS IAM credentials in environment variables.");
}

export const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-southeast-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
