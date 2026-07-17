export type DashboardSummary = {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    largestExpense: number;
};

export type CategorySpending = {
    category: string;
    amount: number;
};