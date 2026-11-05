// tests/setup.ts
import { vi } from "vitest";

// Inject fake test environment variables to satisfy initializers
process.env.AWS_ACCESS_KEY_ID = "mock-access-key";
process.env.AWS_SECRET_ACCESS_KEY = "mock-secret-key";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "mock-project-id";

// Mock Firebase Admin App Setup globally so it doesn't try to look for true certificates
vi.mock("@/src/libs/firebaseAdmin", () => ({
    adminDb: {
        collection: vi.fn(() => ({
            doc: vi.fn(() => ({
                get: vi.fn(() => Promise.resolve({ exists: true, data: () => ({ userId: "owner_123" }) })),
                update: vi.fn(() => Promise.resolve())
            }))
        }))
    }
}));