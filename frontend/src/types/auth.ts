export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    displayName: string;
    email: string;
    password: string;
};

export type AuthResponse = {
    token: string;
    expiresAt: string;
    userId: string;
    displayName: string;
    email: string;
};

export type AuthUser = {
    userId: string;
    displayName: string;
    email: string;
    expiresAt: string;
};