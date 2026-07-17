export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    displayName: string;
    email: string;
    password: string;
    householdCode?: string;
};

export type AuthResponse = {
    token: string;
    expiresAt: string;
    userId: string;
    displayName: string;
    email: string;
    householdName: string;
    householdCode: string;
};

export type AuthUser = {
    userId: string;
    displayName: string;
    email: string;
    expiresAt: string;
    householdName: string;
    householdCode: string;
};
