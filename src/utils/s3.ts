import {PutObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";
import { s3Client } from "../libs/s3"; // Relative path pointing directly to your src folder

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "auroragiftshop";
const REGION = process.env.AWS_REGION || "ap-southeast-2";

/**
 * Uploads a file buffer directly to the S3 bucket
 * @param fileBuffer The binary data of the image (Buffer)
 * @param fileName The original file name (e.g., "mug.jpg")
 * @param mimeType The file type (e.g., "image/jpeg", "image/png")
 * @returns The public URL of the uploaded image
 */
export async function uploadProductImage(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
): Promise<string> {
    // Format file name: remove spaces and append a unique timestamp to prevent overwriting
    const cleanFileName = `products/${Date.now()}-${fileName.replace(/\s+/g, "-")}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: cleanFileName,
        Body: fileBuffer,
        ContentType: mimeType,
    });

    try {
        await s3Client.send(command);
        // Construct and return the public URL for your e-commerce storefront
        return `https://${BUCKET_NAME}.s3.${REGION}://{cleanFileName}`;
    } catch (error) {
        console.error("Failed to upload image to S3:", error);
        throw new Error("S3 upload execution failed.");
    }
}

/**
 * Deletes a product image from S3 using its public URL
 * @param imageUrl The full public S3 URL of the image (e.g., https://auroragiftshop.s3...)
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
    try {
        // Extract the object key (e.g., "products/12345-mug.jpg") from the full URL
        const urlPattern = new RegExp(`https://${BUCKET_NAME}\.s3\.${REGION}\.amazonaws\.com/(.+)`);
        const match = imageUrl.match(urlPattern);

        if (!match || !match[1]) {
            throw new Error("Invalid S3 image URL format provided.");
        }

        const fileKey = match[1];

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        await s3Client.send(command);
    } catch (error) {
        console.error("Failed to delete image from S3:", error);
        throw new Error("S3 deletion execution failed.");
    }
}
