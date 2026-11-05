import { describe, it, expect, vi } from "vitest";
import { validateOwnership } from "@/src/libs/auth-helpers";
import { headers } from "next/headers";

// Mock the Next.js standard headers lookup utility
vi.mock("next/headers", () => ({
    headers: vi.fn(),
}));

describe("validateOwnership Utility Helper", () => {
    it("should return false if no authenticated user ID header exists", async () => {
        vi.mocked(headers).mockResolvedValue(new Headers() as any);

        const isAuthorized = await validateOwnership("owner_123", "orders");
        expect(isAuthorized).toBe(false);
    });

    it("should return true immediately if the user is a superadmin", async () => {
        const mockHeaders = new Headers();
        mockHeaders.set("x-user-id", "admin_999");
        mockHeaders.set("x-user-role", "superadmin");
        vi.mocked(headers).mockResolvedValue(mockHeaders as any);

        const isAuthorized = await validateOwnership("owner_123", "orders");
        expect(isAuthorized).toBe(true);
    });

    it("should allow access if user has global All permission, regardless of true owner", async () => {
        const mockHeaders = new Headers();
        mockHeaders.set("x-user-id", "manager_456");
        mockHeaders.set("x-user-role", "manager");
        mockHeaders.set("x-user-permissions", JSON.stringify(["orders.readAll"]));
        vi.mocked(headers).mockResolvedValue(mockHeaders as any);

        const isAuthorized = await validateOwnership("customer_789", "orders");
        expect(isAuthorized).toBe(true);
    });

    it("should allow access if user matches target owner ID and possesses an Own token permission", async () => {
        const mockHeaders = new Headers();
        mockHeaders.set("x-user-id", "customer_789");
        mockHeaders.set("x-user-role", "customer");
        mockHeaders.set("x-user-permissions", JSON.stringify(["orders.cancelOwn"]));
        vi.mocked(headers).mockResolvedValue(mockHeaders as any);

        const isAuthorized = await validateOwnership("customer_789", "orders");
        expect(isAuthorized).toBe(true);
    });

    it("should block access if the user has an Own permission but does not match target data owner ID", async () => {
        const mockHeaders = new Headers();
        mockHeaders.set("x-user-id", "attacker_666");
        mockHeaders.set("x-user-role", "customer");
        mockHeaders.set("x-user-permissions", JSON.stringify(["orders.cancelOwn"]));
        vi.mocked(headers).mockResolvedValue(mockHeaders as any);

        const isAuthorized = await validateOwnership("victim_111", "orders");
        expect(isAuthorized).toBe(false);
    });
});
