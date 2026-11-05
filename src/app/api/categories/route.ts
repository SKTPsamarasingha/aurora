import {NextRequest, NextResponse} from "next/server";
import {collection, getDocs, doc, setDoc, serverTimestamp, query, orderBy} from "firebase/firestore";
import {uploadFileToS3} from "@/src/libs/s3-upload";
import {createCategorySchema} from "@/src/schemas/validation";
import {db} from "@/src/libs/firebase";

export async function GET(request: NextRequest) {
    try {
        const categoriesRef = collection(db, "categories");
        const q = query(categoriesRef, orderBy("sortOrder", "asc"));
        const snapshot = await getDocs(categoriesRef);

        const categories = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log("categories", categories)

        return NextResponse.json({success: true, data: categories}, {status: 200});
    } catch (error: any) {
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Validate fields using Zod
        const rawData = {
            name: formData.get("name"),
            slug: formData.get("slug"),
            description: formData.get("description"),
            isActive: formData.get("isActive"),
            sortOrder: formData.get("sortOrder"),
        };

        const validationResult = createCategorySchema.safeParse(rawData);
        if (!validationResult.success) {
            return NextResponse.json({success: false, error: validationResult.error.format()}, {status: 400});
        }

        const data = validationResult.data;
        const imageFile = formData.get("image") as File | null;

        let imageUrl = "";
        if (imageFile && imageFile.size > 0) {
            // Upload to S3 first; if this fails, it throws and stops execution before Firestore write
            imageUrl = await uploadFileToS3(imageFile, "categories");
        }

        const categoryRef = doc(collection(db, "categories"));
        const newCategoryData = {
            id: categoryRef.id,
            ...data,
            imageUrl,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(categoryRef, newCategoryData);

        return NextResponse.json({success: true, data: newCategoryData}, {status: 201});
    } catch (error: any) {
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}