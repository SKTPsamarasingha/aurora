
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/src/libs/firebaseAdmin";

export const categories = [
    { id: "rings", name: "Rings", slug: "rings" },
    { id: "necklaces", name: "Necklaces", slug: "necklaces" },
    { id: "bracelets", name: "Bracelets", slug: "bracelets" },
    { id: "earrings", name: "Earrings", slug: "earrings" },
];

export const products = [
    {
        id: "ring-01",
        name: "Classic Solitaire Ring",
        categoryId: "rings",
        price: 185000,
        imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Solitaire", shape: "Round", stone: "Diamond" },
    },
    {
        id: "ring-02",
        name: "Oval Engagement Ring",
        categoryId: "rings",
        price: 210000,
        imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Halo", shape: "Oval", stone: "Diamond" },
    },
    {
        id: "ring-03",
        name: "Vintage Gold Ring",
        categoryId: "rings",
        price: 145000,
        imageUrl: "https://images.unsplash.com/photo-1603561596112-db4f3d1b8b4a?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Vintage", shape: "Cushion", stone: "Ruby" },
    },
    {
        id: "ring-04",
        name: "Sapphire Three Stone Ring",
        categoryId: "rings",
        price: 195000,
        imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Three Stone", shape: "Oval", stone: "Blue Sapphire" },
    },
    {
        id: "ring-05",
        name: "Elegant Gold Band",
        categoryId: "rings",
        price: 95000,
        imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Unique", shape: "Emerald", stone: "Emerald" },
    },
    {
        id: "necklace-01",
        name: "Gold Pendant Necklace",
        categoryId: "necklaces",
        price: 45000,
        imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Pendant", stone: "None", metal: "Yellow Gold" },
    },
    {
        id: "necklace-02",
        name: "Diamond Pendant Necklace",
        categoryId: "necklaces",
        price: 85000,
        imageUrl: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Pendant", stone: "Diamond", metal: "White Gold" },
    },
    {
        id: "necklace-03",
        name: "Pearl Necklace",
        categoryId: "necklaces",
        price: 35000,
        imageUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Classic", stone: "Pearl", metal: "Silver" },
    },
    {
        id: "necklace-04",
        name: "Layered Gold Necklace",
        categoryId: "necklaces",
        price: 55000,
        imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Layered", stone: "None", metal: "Yellow Gold" },
    },
    {
        id: "necklace-05",
        name: "Sapphire Necklace",
        categoryId: "necklaces",
        price: 75000,
        imageUrl: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Pendant", stone: "Blue Sapphire", metal: "Gold" },
    },
    {
        id: "bracelet-01",
        name: "Classic Gold Bracelet",
        categoryId: "bracelets",
        price: 40000,
        imageUrl: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Chain", metal: "Yellow Gold" },
    },
    {
        id: "bracelet-02",
        name: "Diamond Tennis Bracelet",
        categoryId: "bracelets",
        price: 125000,
        imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85&sat=10",
        attributes: { style: "Tennis", stone: "Diamond", metal: "White Gold" },
    },
    {
        id: "bracelet-03",
        name: "Pearl Beaded Bracelet",
        categoryId: "bracelets",
        price: 22000,
        imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85&sat=-20",
        attributes: { style: "Beaded", stone: "Pearl", metal: "Gold" },
    },
    {
        id: "bracelet-04",
        name: "Minimal Gold Bangle",
        categoryId: "bracelets",
        price: 38000,
        imageUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85&sat=15",
        attributes: { style: "Bangle", metal: "Yellow Gold" },
    },
    {
        id: "bracelet-05",
        name: "Gemstone Link Bracelet",
        categoryId: "bracelets",
        price: 65000,
        imageUrl: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85&sat=20",
        attributes: { style: "Link", stone: "Sapphire", metal: "Gold" },
    },
    {
        id: "earring-01",
        name: "Diamond Stud Earrings",
        categoryId: "earrings",
        price: 42000,
        imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Stud", stone: "Diamond", metal: "White Gold" },
    },
    {
        id: "earring-02",
        name: "Classic Gold Hoop Earrings",
        categoryId: "earrings",
        price: 28000,
        imageUrl: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85",
        attributes: { style: "Hoop", metal: "Yellow Gold" },
    },
    {
        id: "earring-03",
        name: "Pearl Drop Earrings",
        categoryId: "earrings",
        price: 32000,
        imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85&h=900",
        attributes: { style: "Drop", stone: "Pearl", metal: "Gold" },
    },
    {
        id: "earring-04",
        name: "Sapphire Stud Earrings",
        categoryId: "earrings",
        price: 48000,
        imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85&sat=-30",
        attributes: { style: "Stud", stone: "Blue Sapphire", metal: "Gold" },
    },
    {
        id: "earring-05",
        name: "Elegant Drop Earrings",
        categoryId: "earrings",
        price: 35000,
        imageUrl: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85&h=800",
        attributes: { style: "Drop", metal: "Rose Gold" },
    },
];

async function seedCategories() {
    for (let i = 0; i < categories.length; i += 400) {
        const batch = adminDb.batch();

        for (const category of categories.slice(i, i + 400)) {
            batch.set(
                adminDb.collection("categories").doc(category.id),
                {
                    ...category,
                    isActive: true,
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );
        }

        await batch.commit();
    }

    console.log(`Seeded ${categories.length} categories.`);
}

async function seedProducts() {
    for (let i = 0; i < products.length; i += 400) {
        const batch = adminDb.batch();

        for (const product of products.slice(i, i + 400)) {
            batch.set(
                adminDb.collection("products").doc(product.id),
                {
                    ...product,
                    slug: product.id,
                    currency: "LKR",
                    description: `${product.name} from our jewellery collection.`,
                    imageAlt: product.name,
                    images: [product.imageUrl],
                    stock: 10,
                    isActive: true,
                    createdAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );
        }

        await batch.commit();
    }

    console.log(`Seeded ${products.length} products.`);
}

async function seedDatabase() {
    await seedCategories();
    await seedProducts();

    console.log("Jewellery database seed completed.");
}

seedDatabase().catch((error) => {
    console.error("Failed to seed jewellery database:", error);
    process.exitCode = 1;
});
