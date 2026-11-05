import {z} from "zod";
import {productQuerySchema} from "@/src/schemas/validation";


export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;

    categoryId: string;
    categoryName: string;

    price: number;
    currency: "LKR";
    compareAtPrice?: number;

    images: string[];
    imageAlt: string;

    attributes: {
        style?: string;
        shape?: string;
        stone?: string;
        material?: string;
        color?: string;
    };

    stock: number;
    sku: string;

    isActive: boolean;
    isFeatured: boolean;

    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
}


export type ProductQueryPayload = z.infer<typeof productQuerySchema>;
