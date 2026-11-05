
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { adminApp, adminDb } from "@/src/libs/firebaseAdmin";

const auth = getAuth(adminApp);

type SeedAccount = {
    role: "superadmin" | "admin" | "customer";
    email?: string;
    password?: string;
    displayName: string;
};

const accounts: SeedAccount[] = [
    {
        role: "superadmin",
        email: process.env.FIREBASE_SUPERADMIN_EMAIL,
        password: process.env.FIREBASE_SUPERADMIN_PASSWORD,
        displayName: "Super Administrator",
    },
    {
        role: "admin",
        email: process.env.FIREBASE_ADMIN_EMAIL,
        password: process.env.FIREBASE_ADMIN_PASSWORD,
        displayName: "Store Administrator",
    },
    {
        role: "customer",
        email: process.env.FIREBASE_CUSTOMER_EMAIL,
        password: process.env.FIREBASE_CUSTOMER_PASSWORD,
        displayName: "Test Customer",
    },
];

async function getOrCreateUser(account: SeedAccount) {
    if (!account.email || !account.password) {
        throw new Error(`Missing email or password for role: ${account.role}`);
    }

    let user;

    try {
        user = await auth.getUserByEmail(account.email);
        console.log(`Auth user already exists: ${account.email}`);
    } catch (error: unknown) {
        if (
            typeof error !== "object" ||
            error === null ||
            !("code" in error) ||
            error.code !== "auth/user-not-found"
        ) {
            throw error;
        }

        user = await auth.createUser({
            email: account.email,
            password: account.password,
            displayName: account.displayName,
            emailVerified: false,
            disabled: false,
        });

        console.log(`Created Auth user: ${account.email}`);
    }

    return user;
}

async function seedUser(account: SeedAccount) {
    const user = await getOrCreateUser(account);

    // Preserve existing custom claims while assigning the role.
    await auth.setCustomUserClaims(user.uid, {
        ...user.customClaims,
        role: account.role,
    });

    const userRef = adminDb.collection("users").doc(user.uid);
    const existingDoc = await userRef.get();

    const profile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || account.displayName,
        role: account.role,
        status: "active",
        authProviders: user.providerData.map(
            (provider) => provider.providerId
        ),
        updatedAt: FieldValue.serverTimestamp(),
        ...(!existingDoc.exists
            ? { createdAt: FieldValue.serverTimestamp() }
            : {}),
    };

    await userRef.set(profile, { merge: true });

    console.log(
        `Seeded ${account.role}: ${user.email} (${user.uid})`
    );
}

async function seedUsers() {
    try {
        for (const account of accounts) {
            await seedUser(account);
        }

        console.log("User seeding completed.");
    } catch (error) {
        console.error("User seeding failed:", error);
        process.exitCode = 1;
    }
}

seedUsers();
