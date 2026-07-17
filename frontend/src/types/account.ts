export type AccountVisibility = "Personal" | "Shared";

export type Account = {
    id: string;
    name: string;
    balance: number;
    startingBalance: number;
    visibility: AccountVisibility;
    savingsGoalAmount: number | null;
    savingsGoalDate: string | null;
    savingsGoalRemaining: number | null;
    requiredMonthlySavings: number | null;
};

export type CreateAccount = {
    name: string;
    startingBalance: number;
    visibility: AccountVisibility;
};

export type UpdateAccount = CreateAccount;

export type UpdateSavingsGoal = {
    targetAmount: number;
    targetDate: string;
};
