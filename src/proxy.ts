import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {doc, getDoc} from "firebase/firestore";
import {db} from "@/src/libs/firebase";
import {parseJwtPayload} from "@/src/utils/helper";

// Special route overrides mapping specific path prefixes to required permissions[cite: 7]
const SPECIAL_ROUTE_OVERRIDES: Record<string, Record<string, string>> = {
    "/api/cart": {
        GET: "cart.manageOwn",
        POST: "cart.manageOwn",
        PUT: "cart.manageOwn",
        PATCH: "cart.manageOwn",
        DELETE: "cart.manageOwn",
    },
    "/api/profile": {
        GET: "profile.readOwn",
        PUT: "profile.updateOwn",
        PATCH: "profile.updateOwn",
    },
};

// Map HTTP methods to standard CRUD actions
function getActionFromMethod(method: string): string | null {
    switch (method.toUpperCase()) {
        case "GET":
            return "read";
        case "POST":
            return "create";
        case "PUT":
        case "PATCH":
            return "update";
        case "DELETE":
            return "delete";
        default:
            return null;
    }
}

// Dynamic permission generator matching Firestore schema (e.g., "products.read")[cite: 7]
function getDynamicPermission(pathname: string, method: string): string | null {
    // Check for special route overrides first
    for (const [routePrefix, methodMap] of Object.entries(SPECIAL_ROUTE_OVERRIDES)) {
        if (pathname.startsWith(routePrefix)) {
            return methodMap[method.toUpperCase()] || null;
        }
    }

    // Standard REST parsing: /api/{resource}/{id} -> resource.action
    const segments = pathname.split("/").filter(Boolean);
    // segments[0] = 'api', segments[1] = resource (e.g., 'products')
    if (segments.length < 2 || segments[0] !== "api") return null;

    let resource = segments[1].toLowerCase();
    const action = getActionFromMethod(method);

    if (!resource || !action) return null;

    if (segments[1].toLowerCase() === "admin") {
        if (segments.length < 3) return null; // /api/admin with nothing else is invalid
        resource = segments[2].toLowerCase();
    } else {
        // Standard user endpoints (e.g., /api/products -> products.read)
        resource = segments[1].toLowerCase();
    }

    console.log("Proxy", pathname, method)


    return `${resource}.${action}`;
}


export async function proxy(request: NextRequest) {
    const {pathname} = request.nextUrl;
    const method = request.method;
    console.log("COMPLETE URL:", request.url);
    // Only target API routes
    if (!pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    const payload = parseJwtPayload(request);

    if (!payload || !payload.user_id) {
        return NextResponse.json(
            {error: "Unauthorized: Invalid token payload"},
            {status: 401}
        );
    }

    const role = payload.role || "customer";

    let permissions = []
    if (role) {
        const roleRef = await doc(db, "roles", role)
        const roleSnap = await getDoc(roleRef);
        if (roleSnap.exists()) {
            const roleData = roleSnap.data();
            permissions = Array.isArray(roleData.permissions) ? roleData.permissions : [];
        }
    }


    // // 2. Superadmin Bypass
    if (role === "superadmin") {
        const response = NextResponse.next();
        response.headers.set("x-user-id", payload.user_id);
        response.headers.set("x-user-role", role);
        response.headers.set("x-user-permissions", JSON.stringify(permissions));
        return response;
    }

    // 3. Determine Required Permission
    const requiredPermission = getDynamicPermission(pathname, method);
    console.log("Proxy requiredPermission", requiredPermission)


    if (!requiredPermission) {
        return NextResponse.json(
            {error: "Forbidden: Route mapping or permission not defined"},
            {status: 403}
        );
    }

    // 4. Verify Permission (Exact match or scoped variants ending in 'All' or 'Own')
    // e.g., if required is 'orders.read', matches 'orders.read', 'orders.readAll', or 'orders.readOwn'
    const [resource, action] = requiredPermission.split(".");

    const hasPermission = permissions.some((p) => {
        if (p === requiredPermission) return true;
        if (p === `${resource}.${action}All`) return true;
        if (p === `${resource}.${action}Own`) return true;
        return false;
    });


    if (!hasPermission) {
        return NextResponse.json(
            {error: `Forbidden: Insufficient permissions. Required: ${requiredPermission}`},
            {status: 403}
        );
    }

    // 5. Inject user metadata into headers for downstream API handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.user_id);
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-user-permissions", JSON.stringify(permissions));


    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// Replace your old config with this consolidated version
export const config = {
    matcher: [
        "/api/:path*",       // Protects standard user endpoints
        "/api/admin/:path*"  // Protects your nested admin endpoints
    ],
};
