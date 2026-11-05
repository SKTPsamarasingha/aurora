
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/src/libs/firebaseAdmin";

const permissions = [
    // Products
    { id: "products.read", resource: "products", action: "read", description: "View products" },
    { id: "products.create", resource: "products", action: "create", description: "Create products" },
    { id: "products.update", resource: "products", action: "update", description: "Update products" },
    { id: "products.delete", resource: "products", action: "delete", description: "Delete products" },

    // Categories
    { id: "categories.read", resource: "categories", action: "read", description: "View categories" },
    { id: "categories.create", resource: "categories", action: "create", description: "Create categories" },
    { id: "categories.update", resource: "categories", action: "update", description: "Update categories" },
    { id: "categories.delete", resource: "categories", action: "delete", description: "Delete categories" },

    // Orders
    { id: "orders.readAll", resource: "orders", action: "readAll", description: "View all orders" },
    { id: "orders.update", resource: "orders", action: "update", description: "Update order status" },
    { id: "orders.cancel", resource: "orders", action: "cancel", description: "Cancel orders" },
    { id: "orders.readOwn", resource: "orders", action: "readOwn", description: "View own orders" },
    { id: "orders.createOwn", resource: "orders", action: "createOwn", description: "Place orders" },
    { id: "orders.cancelOwn", resource: "orders", action: "cancelOwn", description: "Cancel eligible own orders" },

    // Users
    { id: "users.readAll", resource: "users", action: "readAll", description: "View all users" },
    { id: "users.update", resource: "users", action: "update", description: "Update user profiles" },
    { id: "users.manageRoles", resource: "users", action: "manageRoles", description: "Manage user roles" },
    { id: "users.delete", resource: "users", action: "delete", description: "Delete users" },

    // Store settings
    { id: "settings.read", resource: "settings", action: "read", description: "View store settings" },
    { id: "settings.update", resource: "settings", action: "update", description: "Update store settings" },

    // Customer account
    { id: "profile.readOwn", resource: "profile", action: "readOwn", description: "View own profile" },
    { id: "profile.updateOwn", resource: "profile", action: "updateOwn", description: "Update own profile" },
    { id: "cart.manageOwn", resource: "cart", action: "manageOwn", description: "Manage own cart" },
];

const allPermissionIds = permissions.map(({ id }) => id);

const roles = [
    {
        id: "superadmin",
        name: "Super Administrator",
        description: "Full control over the store and administrator accounts.",
        permissions: allPermissionIds,
    },
    {
        id: "admin",
        name: "Administrator",
        description: "Manage store operations without superadmin privileges.",
        permissions: [
            "products.read",
            "products.create",
            "products.update",
            "products.delete",
            "categories.read",
            "categories.create",
            "categories.update",
            "categories.delete",
            "orders.readAll",
            "orders.update",
            "orders.cancel",
            "users.readAll",
            "users.update",
            "settings.read",
            "settings.update",
        ],
    },
    {
        id: "customer",
        name: "Customer",
        description: "Browse products and manage their own account, cart, and orders.",
        permissions: [
            "products.read",
            "categories.read",
            "profile.readOwn",
            "profile.updateOwn",
            "cart.manageOwn",
            "orders.readOwn",
            "orders.createOwn",
            "orders.cancelOwn",
        ],
    },
];

async function seedPermissions() {
    const batch = adminDb.batch();

    for (const permission of permissions) {
        const { id, ...data } = permission;

        batch.set(
            adminDb.collection("permissions").doc(id),
            {
                ...data,
                name: id,
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );
    }

    await batch.commit();
    console.log(`Seeded ${permissions.length} permissions.`);
}

async function seedRoles() {
    const batch = adminDb.batch();

    for (const role of roles) {
        const { id, ...data } = role;

        batch.set(
            adminDb.collection("roles").doc(id),
            {
                ...data,
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );
    }

    await batch.commit();
    console.log(`Seeded ${roles.length} roles.`);
}

async function seedRBAC() {
    try {
        await seedPermissions();
        await seedRoles();
        console.log("RBAC seeding completed successfully.");
    } catch (error) {
        console.error("RBAC seeding failed:", error);
        process.exitCode = 1;
    }
}

seedRBAC();
