export type ApiValidationError = {
    title?: string;
    status?: number;
    errors?: Record<string, string[]>;
};