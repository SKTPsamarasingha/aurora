import { z } from "zod";

// --- CATEGORY SCHEMAS ---
export const createCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional().default(""),
    isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(true),
    sortOrder: z.preprocess((val) => (val ? parseInt(val as string, 10) : 0), z.number()).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

// --- PRODUCT SCHEMAS ---
export const productAttributesSchema = z.object({
    style: z.string().optional(),
    shape: z.string().optional(),
    stone: z.string().optional(),
    material: z.string().optional(),
    color: z.string().optional(),
});

export const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional().default(""),
    categoryId: z.string().min(1, "Category ID is required"),
    categoryName: z.string().optional().default(""),
    price: z.preprocess((val) => parseFloat(val as string), z.number().positive("Price must be a positive number")),
    compareAtPrice: z.preprocess((val) => (val ? parseFloat(val as string) : undefined), z.number().positive().optional()),
    stock: z.preprocess((val) => (val ? parseInt(val as string, 10) : 0), z.number().nonnegative()),
    sku: z.string().min(1, "SKU is required"),
    imageAlt: z.string().optional().default(""),
    isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(true),
    isFeatured: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(false),
    attributes: z.preprocess((val) => {
        if (typeof val === "string") {
            try { return JSON.parse(val); } catch { return {}; }
        }
        return val || {};
    }, productAttributesSchema).optional(),
});

export const productQuerySchema = z.object({
    categoryIds: z.array(z.string()).optional(),
    attributes: z.object({
        style: z.string().optional(),
        shape: z.string().optional(),
        stone: z.string().optional(),
        material: z.string().optional(),
        color: z.string().optional(),
    }).optional(),
    priceRange: z.object({
        min: z.number().nonnegative().optional(),
        max: z.number().nonnegative().optional(),
    }).optional(),
    inStockOnly: z.boolean().optional().default(false),
    sortBy: z.enum(["price-asc", "price-desc", "newest", "popular"]).optional().default("newest"),
    limit: z.number().positive().max(100).optional().default(20),
    page: z.number().positive().optional().default(1),
});


export const updateProductSchema = createProductSchema.partial();

export const orderItemSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    name: z.string().min(1, "Product name is required"),
    price: z.number().positive("Price must be positive"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    image: z.string().optional().default(""),
});

export const shippingAddressSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().optional().default(""),
    country: z.string().min(1, "Country is required"),
});

export const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
    shippingAddress: shippingAddressSchema,
    subtotal: z.number().positive("Subtotal must be positive"),
    currency: z.string().default("LKR"),
    notes: z.string().optional().default(""),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "pending",
        "crafting",
        "quality_check",
        "ready_for_dispatch",
        "shipped",
        "delivered",
        "cancelled"
    ]),
});