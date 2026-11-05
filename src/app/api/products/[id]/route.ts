import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/libs/firebase";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { uploadFileToS3 } from "@/src/libs/s3-upload";
import { updateProductSchema } from "@/src/schemas/validation";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const formData = await request.formData();

        const rawData: Record<string, any> = {};
        const fields = ["name", "slug", "description", "categoryId", "categoryName", "price", "compareAtPrice", "stock", "sku", "imageAlt", "isActive", "isFeatured", "attributes"];

        for (const field of fields) {
            if (formData.has(field)) {
                rawData[field] = formData.get(field);
            }
        }

        const validationResult = updateProductSchema.safeParse(rawData);
        if (!validationResult.success) {
            return NextResponse.json({ success: false, error: validationResult.error.format() }, { status: 400 });
        }

        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
        }

        const updateData: any = {
            ...validationResult.data,
            updatedAt: serverTimestamp(),
        };

        const newImageFiles = formData.getAll("images") as File[];
        if (newImageFiles && newImageFiles.length > 0 && newImageFiles[0].size > 0) {
            const uploadedUrls: string[] = [];
            for (const file of newImageFiles) {
                const url = await uploadFileToS3(file, "products");
                uploadedUrls.push(url);
            }
            updateData.images = uploadedUrls;
        }

        await updateDoc(docRef, updateData);

        return NextResponse.json({ success: true, message: "Product updated successfully." }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
        }

        await deleteDoc(docRef);
        return NextResponse.json({ success: true, message: "Product deleted successfully." }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}