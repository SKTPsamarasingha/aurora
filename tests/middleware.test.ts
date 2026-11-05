import { describe, it, expect, vi, beforeEach } from "vitest";
import { proxy } from "@/src/proxy";
import { NextRequest, NextResponse } from "next/server";

function createMockRequest(pathname: string, method: string, tokenPayload?: any) {
    const headers = new Headers();
    if (tokenPayload) {
        const base64Payload = btoa(JSON.stringify(tokenPayload));
        headers.set("authorization", `Bearer mockHeader.${base64Payload}.mockSignature`);
    }

    return new NextRequest(new URL(`http://localhost:3000${pathname}`), {
        method,
        headers,
    });
}

describe("RBAC Edge Middleware Validation", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("should pass non-API routes immediately", async () => {
        const req = createMockRequest("/dashboard/settings", "GET");
        const res = await proxy(req);

        expect(res).toBeInstanceOf(NextResponse);
        expect(res?.headers.get("x-middleware-next")).toBe("1");
    });

    it("should block requests missing an authorization header with 401", async () => {
        const req = createMockRequest("/api/products", "GET");
        const res = await proxy(req);

        expect(res?.status).toBe(401);
        const body = await res?.json();
        expect(body.error).toContain("Missing or malformed token");
    });

    it("should bypass all checks for a superadmin role", async () => {
        // Superadmin uses response header mutations directly, which works fine out of the box
        const payload = { uid: "super_123", role: "superadmin", permissions: [] };
        const req = createMockRequest("/api/secret-admin-route", "DELETE", payload);
        const res = await proxy(req);

        expect(res?.headers.get("x-user-id")).toBe("super_123");
        expect(res?.headers.get("x-user-role")).toBe("superadmin");
    });

    it("should correctly resolve dynamic permissions (e.g., PUT /api/products/123 -> products.update)", async () => {
        const payload = { uid: "user_123", role: "manager", permissions: ["products.update"] };
        const req = createMockRequest("/api/products/prod_abc", "PUT", payload);

        // Spy on NextResponse.next to intercept the request header injection 🕵️‍♂️
        const nextSpy = vi.spyOn(NextResponse, "next");

        await proxy(req);

        expect(nextSpy).toHaveBeenCalled();
        const calls = nextSpy.mock.calls[0][0] as any;
        const injectedHeaders = new Headers(calls?.request?.headers);

        expect(injectedHeaders.get("x-user-id")).toBe("user_123");
        expect(injectedHeaders.get("x-user-permissions")).toContain("products.update");
    });

    it("should fall back gracefully to match *Own / *All permissions dynamically", async () => {
        const payload = { uid: "customer_123", role: "customer", permissions: ["orders.readOwn"] };
        const req = createMockRequest("/api/orders/order_789", "GET", payload);

        const nextSpy = vi.spyOn(NextResponse, "next");

        await proxy(req);

        const calls = nextSpy.mock.calls[0][0] as any;
        const injectedHeaders = new Headers(calls?.request?.headers);
        expect(injectedHeaders.get("x-user-id")).toBe("customer_123");
    });

    it("should enforce special route overrides correctly (e.g., /api/cart)", async () => {
        const payload = { uid: "customer_123", role: "customer", permissions: ["cart.manageOwn"] };
        const req = createMockRequest("/api/cart", "GET", payload);

        const nextSpy = vi.spyOn(NextResponse, "next");

        await proxy(req);

        const calls = nextSpy.mock.calls[0][0] as any;
        const injectedHeaders = new Headers(calls?.request?.headers);
        expect(injectedHeaders.get("x-user-id")).toBe("customer_123");
    });

    it("should block requests with a 403 if permissions are insufficient", async () => {
        const payload = { uid: "customer_123", role: "customer", permissions: ["products.read"] };
        const req = createMockRequest("/api/categories", "POST", payload);
        const res = await proxy(req);

        expect(res?.status).toBe(403);
        const body = await res?.json();
        expect(body.error).toContain("Insufficient permissions");
    });
});
