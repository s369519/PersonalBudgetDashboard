import axios from "axios";

import type { ApiValidationError } from "../types/apiError";

export function getApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    if (!axios.isAxiosError<ApiValidationError>(error)) {
        return fallbackMessage;
    }

    const responseData = error.response?.data;

    if (!responseData) {
        return fallbackMessage;
    }

    if (responseData.errors) {
        const messages = Object.values(responseData.errors).flat();

        if (messages.length > 0) {
            return messages.join(" ");
        }
    }

    if (responseData.title) {
        return responseData.title;
    }

    return fallbackMessage;
}