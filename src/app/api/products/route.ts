import {NextRequest, NextResponse} from "next/server";
import {db} from "@/src/libs/firebase";
import {collection, getDocs, doc, setDoc, serverTimestamp, query, orderBy} from "firebase/firestore";
import {uploadFileToS3} from "@/src/libs/s3-upload";
import {createProductSchema, productQuerySchema} from "@/src/schemas/validation";

export async function GET(request: NextRequest) {
    try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const products = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));


        return NextResponse.json({success: true, data: products}, {status: 200});
    } catch (error: any) {
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const rawData = {
            name: formData.get("name"),
            slug: formData.get("slug"),
            description: formData.get("description"),
            categoryId: formData.get("categoryId"),
            categoryName: formData.get("categoryName"),
            price: formData.get("price"),
            compareAtPrice: formData.get("compareAtPrice"),
            stock: formData.get("stock"),
            sku: formData.get("sku"),
            imageAlt: formData.get("imageAlt"),
            isActive: formData.get("isActive"),
            isFeatured: formData.get("isFeatured"),
            attributes: formData.get("attributes"),
        };

        const validationResult = createProductSchema.safeParse(rawData);
        if (!validationResult.success) {
            return NextResponse.json({success: false, error: validationResult.error.format()}, {status: 400});
        }

        const data = validationResult.data;

        // Handle multi-image upload to S3 safely
        const imageFiles = formData.getAll("images") as File[];
        const uploadedImageUrls: string[] = [];

        for (const file of imageFiles) {
            if (file && file.size > 0) {
                // If any S3 upload throws an error, execution stops immediately, preventing incomplete DB states
                const url = await uploadFileToS3(file, "products");
                uploadedImageUrls.push(url);
            }
        }

        const productRef = doc(collection(db, "products"));
        const newProductData = {
            id: productRef.id,
            ...data,
            currency: "LKR" as const,
            images: uploadedImageUrls,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(productRef, newProductData);

        return NextResponse.json({success: true, data: newProductData}, {status: 201});
    } catch (error: any) {
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}

