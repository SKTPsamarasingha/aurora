import {NextRequest, NextResponse} from "next/server";
import {db} from "@/src/libs/firebase";
import {doc, getDoc, updateDoc, deleteDoc, serverTimestamp} from "firebase/firestore";
import {uploadFileToS3} from "@/src/libs/s3-upload";
import {updateCategorySchema} from "@/src/schemas/validation";

interface RouteParams {
    params: Promise<{ id: string }>;
}


export async function GET(request: NextRequest, {params}: RouteParams) {
    try {
        const {id} = await params;
        const docRef = doc(db, "categories", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({success: false, error: "Category not found."}, {status: 404});
        }

        return NextResponse.json({success: true, data: {id: docSnap.id, ...docSnap.data()}}, {status: 200});
    } catch (error: any) {
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}

export async function PUT(request: NextRequest, {params}: RouteParams) {
    try {
        const {id} = await params;
        const formData = await request.formData();

        const rawData: Record<string, any> = {};
        if (formData.has("name")) rawData.name = formData.get("name");
        if (formData.has("slug")) rawData.slug = formData.get("slug");
        if (formData.has("description")) rawData.description = formData.get("description");
        if (formData.has("isActive")) rawData.isActive = formData.get("isActive");
        if (formData.has("sortOrder")) rawData.sortOrder = formData.get("sortOrder");

        const validationResult = updateCategorySchema.safeParse(rawData);
        if (!validationResult.success) {
            return NextResponse.json({success: false, error: validationResult.error.format()}, {status: 400});
        }

        const docRef = doc(db, "categories", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({success: false, error: "Category not found."}, {status: 404});
        }

        const updateData: any = {
            ...validationResult.data,
            updatedAt: serverTimestamp(),
        };

        const imageFile = formData.get("image") as File | null;
        if (imageFile && imageFile.size > 0) {
            updateData.imageUrl = await uploadFileToS3(imageFile, "categories");
        }

        await updateDoc(docRef, updateData);

        return NextResponse.json({success: true, message: "Category updated successfully."}, {status: 200});
    } catch (error: any) {
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}

export async function DELETE(request: NextRequest, {params}: RouteParams) {
    try {
        const {id} = await params;
        const docRef = doc(db, "categories", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({success: false, error: "Category not found."}, {status: 404});
        }

        await deleteDoc(docRef);
        return NextResponse.json({success: true, message: "Category deleted successfully."}, {status: 200});
    } catch (error: any) {
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}