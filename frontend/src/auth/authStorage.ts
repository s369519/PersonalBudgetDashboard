import type {
    AuthResponse,
    AuthUser,
} from "../types/auth";

const TOKEN_KEY = "token";
const USER_KEY = "authUser";

export function saveAuthSession(response: AuthResponse) {
    const user: AuthUser = {
        userId: response.userId,
        displayName: response.displayName,
        email: response.email,
        expiresAt: response.expiresAt,
        householdName: response.householdName,
        householdCode: response.householdCode,
    };

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as AuthUser;
    } catch {
        clearAuthSession();
        return null;
    }
}

export function isSessionValid(): boolean {
    const token = getToken();
    const user = getStoredUser();

    if (!token || !user) {
        return false;
    }

    const expirationTime = new Date(user.expiresAt).getTime();

    if (Number.isNaN(expirationTime)) {
        clearAuthSession();
        return false;
    }

    if (expirationTime <= Date.now()) {
        clearAuthSession();
        return false;
    }

    return true;
}

export function clearAuthSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}
