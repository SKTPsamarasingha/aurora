import {NextRequest, NextResponse} from "next/server";

export function parseJwtPayload(request: NextRequest | Request): any {
    try {
        // 1. Extract Authorization Bearer Token
        const authHeader = request.headers.get("authorization");


        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                {error: "Unauthorized: Missing or malformed token"},
                {status: 401}
            );
        }

        const token = authHeader.split(" ")[1];
        const base64Url = token.split(".")[1];

        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}
