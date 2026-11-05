import { expect, test, describe } from "vitest";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from '../src/libs/s3'; // Relative path pointing directly to your src folder

describe("S3 AWS Live Connection Test", () => {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const testKey = `test-fixtures/connection-test-${Date.now()}.txt`;

    test("Environment variables should be defined", () => {
        expect(process.env.AWS_ACCESS_KEY_ID).toBeDefined();
        expect(process.env.AWS_SECRET_ACCESS_KEY).toBeDefined();
        expect(process.env.AWS_REGION).toBe("ap-southeast-2");
        expect(bucketName).toBe("auroragiftshop");
    });

    test("Should successfully upload and delete a test file in S3", async () => {
        // 1. Upload a dummy text file
        const uploadCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: testKey,
            Body: "Vitest connection check running successfully.",
            ContentType: "text/plain",
        });

        const uploadResponse = await s3Client.send(uploadCommand);
        expect(uploadResponse.$metadata.httpStatusCode).toBe(200);

        // 2. Clean up immediately by deleting the test file
        const deleteCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: testKey,
        });

        const deleteResponse = await s3Client.send(deleteCommand);
        expect(deleteResponse.$metadata.httpStatusCode).toBe(204); // 204 No Content means successful deletion
    });
});



