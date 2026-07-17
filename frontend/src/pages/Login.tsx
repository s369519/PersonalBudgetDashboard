import { useState } from "react";
import {
    Link,
    Navigate,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { getApiErrorMessage } from "../utils/getApiError";

export default function Login() {
    const navigate = useNavigate();

    const {
        login,
        isAuthenticated,
    } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!email.trim() || !password) {
            setError("Email and password are required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await login({
                email: email.trim(),
                password,
            });

            navigate("/", {
                replace: true,
            });
        } catch (requestError) {
            console.error("Login failed:", requestError);

            setError(
                getApiErrorMessage(
                    requestError,
                    "Invalid email or password.",
                ),
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Sign in to manage your finances.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting
                            ? "Signing in..."
                            : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/register"
                        className="font-medium text-blue-600 hover:text-blue-700"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}