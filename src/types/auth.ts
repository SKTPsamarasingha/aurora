export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: string;
    permissions: string[];
    authProviders: string[];
}

export interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}