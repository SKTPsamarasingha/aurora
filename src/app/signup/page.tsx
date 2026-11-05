"use client";

import React, { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
    const { signUp, signInWithGoogle, loading,user } = useAuth();
    const router = useRouter();

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await signUp(email, password, displayName);
            const path = user?.role === "customer" ? '/' : "/dashboard"
            router.push(path);
        } catch (err: any) {
            setError(err.message || "Failed to create an account.");
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        try {
            await signInWithGoogle();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to sign up with Google.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-[#17152b]/60 backdrop-blur-md p-8 shadow-2xl">
                <div>
                    <h2 className="text-center text-3xl font-heading text-foreground">
                        Create a new account
                    </h2>
                </div>

                {error && (
                    <div className="rounded-md bg-red-950/50 border border-red-500/30 p-4 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted">Full Name</label>
                            <input
                                type="text"
                                required
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-gold focus:outline-none sm:text-sm"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-gold focus:outline-none sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-gold focus:outline-none sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center rounded-md bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50"
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-background px-2 text-muted">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-border/10 focus:outline-none focus:ring-2 focus:ring-gold"
                        >
                            <span>Sign up with Google</span>
                        </button>
                    </div>
                </div>

                <p className="mt-4 text-center text-sm text-muted">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-gold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}