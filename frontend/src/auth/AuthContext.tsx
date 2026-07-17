import {
    createContext,
    useContext,
    useState,
} from "react";

import api from "../api/client";

import {
    clearAuthSession,
    getStoredUser,
    isSessionValid,
    saveAuthSession,
} from "./authStorage";

import type {
    AuthResponse,
    AuthUser,
    LoginRequest,
    RegisterRequest,
} from "../types/auth";

type AuthContextValue = {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (request: LoginRequest) => Promise<void>;
    register: (request: RegisterRequest) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(
    undefined,
);

type AuthProviderProps = {
    children: React.ReactNode;
};

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        return isSessionValid() ? getStoredUser() : null;
    });

    async function login(request: LoginRequest) {
        const response = await api.post<AuthResponse>(
            "/Auth/login",
            request,
        );

        saveAuthSession(response.data);

        setUser({
            userId: response.data.userId,
            displayName: response.data.displayName,
            email: response.data.email,
            expiresAt: response.data.expiresAt,
            householdName: response.data.householdName,
            householdCode: response.data.householdCode,
        });
    }

    async function register(request: RegisterRequest) {
        const response = await api.post<AuthResponse>(
            "/Auth/register",
            request,
        );

        saveAuthSession(response.data);

        setUser({
            userId: response.data.userId,
            displayName: response.data.displayName,
            email: response.data.email,
            expiresAt: response.data.expiresAt,
            householdName: response.data.householdName,
            householdCode: response.data.householdCode,
        });
    }

    function logout() {
        clearAuthSession();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider.",
        );
    }

    return context;
}
