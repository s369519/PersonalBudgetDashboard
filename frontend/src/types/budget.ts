export type BudgetVisibility = "Personal" | "Shared";
export type BudgetItemType = "Income" | "Expense";

export type BudgetItem = {
    id: string;
    description: string;
    type: BudgetItemType;
    amount: number;
    sortOrder: number;
    categoryId: string | null;
    categoryName: string | null;
    actualAmount: number;
    difference: number;
};

export type BudgetSheet = {
    id: string;
    name: string;
    month: string;
    visibility: BudgetVisibility;
    totalIncome: number;
    totalExpenses: number;
    remaining: number;
    actualIncome: number;
    actualExpenses: number;
    actualRemaining: number;
    items: BudgetItem[];
};

export type SaveBudgetSheet = {
    name: string;
    month: string;
    visibility: BudgetVisibility;
    items: Array<{
        description: string;
        type: BudgetItemType;
        amount: number;
        categoryId: string | null;
    }>;
};
