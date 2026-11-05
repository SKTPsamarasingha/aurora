export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
}