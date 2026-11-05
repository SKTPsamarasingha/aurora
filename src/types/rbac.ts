export interface FirebaseTokenPayload {
    uid: string;
    email?: string;
    role: string;
    permissions: string[];
    auth_time: number;
    user_id: string;
    [key: string]: any;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface AuthenticatedUser {
    uid: string;
    role: string;
    permissions: string[];
}