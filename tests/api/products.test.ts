import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getCategories, POST as createCategory } from "@/src/api/categories/route";
import { GET as getCategoryById, DELETE as deleteCategory } from "@/src/api/categories/[id]/route";

vi.mock("@/src/libs/firebase", () => ({
    auth: {},
    db: {},
    googleProvider: {},
}));

vi.mock("firebase/firestore", () => ({
    collection: vi.fn(),
    doc: vi.fn(() => ({ id: "mock-category-id" })),
    getDocs: vi.fn(() => ({
        docs: [
            { id: "cat-1", data: () => ({ name: "Rings", slug: "rings", sortOrder: 1, isActive: true }) }
        ]
    })),
    getDoc: vi.fn(() => ({
        exists: () => true,
        id: "mock-category-id",
        data: () => ({ name: "Rings", slug: "rings", sortOrder: 1, isActive: true })
    })),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    serverTimestamp: vi.fn(() => "mock-timestamp"),
}));

vi.mock("@/src/libs/s3-upload", () => ({
    uploadFileToS3: vi.fn(async () => "https://bucket.s3.amazonaws.com/categories/test-image.jpg"),
}));

describe("Category API Endpoints", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("GET /api/categories should return all categories", async () => {
        const req = new NextRequest("http://localhost:3000/api/categories");
        const res = await getCategories(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data).toHaveLength(1);
        expect(json.data[0].name).toBe("Rings");
    });

    it("POST /api/categories should fail validation if name or slug is missing", async () => {
        const formData = new FormData();
        formData.append("description", "Missing name and slug");

        const req = new NextRequest("http://localhost:3000/api/categories", {
            method: "POST",
            body: formData,
        });

        const res = await createCategory(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.success).toBe(false);
    });

    it("POST /api/categories should successfully upload image to S3 and save to Firestore", async () => {
        const formData = new FormData();
        formData.append("name", "Necklaces");
        formData.append("slug", "necklaces");
        formData.append("isActive", "true");
        formData.append("sortOrder", "1");
        formData.append("image", new File(["dummy image content"], "necklace.jpg", { type: "image/jpeg" }));

        const req = new NextRequest("http://localhost:3000/api/categories", {
            method: "POST",
            body: formData,
        });

        const res = await createCategory(req);
        const json = await res.json();

        expect(res.status).toBe(201);
        expect(json.success).toBe(true);
        expect(json.data.imageUrl).toContain("https://");
    });

    it("GET /api/categories/[id] should return a single category", async () => {
        const req = new NextRequest("http://localhost:3000/api/categories/mock-category-id");
        const res = await getCategoryById(req, { params: Promise.resolve({ id: "mock-category-id" }) });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.name).toBe("Rings");
    });

    it("DELETE /api/categories/[id] should delete a category successfully", async () => {
        const req = new NextRequest("http://localhost:3000/api/categories/mock-category-id", {
            method: "DELETE",
        });
        const res = await deleteCategory(req, { params: Promise.resolve({ id: "mock-category-id" }) });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
    });
});