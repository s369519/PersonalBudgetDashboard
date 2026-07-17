import { useState } from "react";
import {
    Link,
    Navigate,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { getApiErrorMessage } from "../utils/getApiError";

export default function Register() {
    const navigate = useNavigate();

    const {
        register,
        isAuthenticated,
    } = useAuth();

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [householdCode, setHouseholdCode] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!displayName.trim()) {
            setError("Name is required.");
            return;
        }

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must contain at least 8 characters.",
            );
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await register({
                displayName: displayName.trim(),
                email: email.trim(),
                password,
                householdCode: householdCode.trim() || undefined,
            });

            navigate("/", {
                replace: true,
            });
        } catch (requestError) {
            console.error("Registration failed:", requestError);

            setError(
                getApiErrorMessage(
                    requestError,
                    "Could not create the account.",
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
                        Create account
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Start managing your personal finances.
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
                            htmlFor="display-name"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Name
                        </label>

                        <input
                            id="display-name"
                            type="text"
                            autoComplete="name"
                            value={displayName}
                            onChange={(event) =>
                                setDisplayName(
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="register-email"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Email
                        </label>

                        <input
                            id="register-email"
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
                            htmlFor="register-password"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Password
                        </label>

                        <input
                            id="register-password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            At least 8 characters, including uppercase,
                            lowercase and a number.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="household-code"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Household code (optional)
                        </label>

                        <input
                            id="household-code"
                            type="text"
                            autoComplete="off"
                            maxLength={12}
                            value={householdCode}
                            onChange={(event) =>
                                setHouseholdCode(event.target.value.toUpperCase())
                            }
                            placeholder="Enter your partner's code"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Leave this empty to create a new household.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:text-blue-700"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
