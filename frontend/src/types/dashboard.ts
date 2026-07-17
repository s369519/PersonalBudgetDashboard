export interface DashboardSummary {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    largestExpense: number;
}

export interface CategorySpending {
    category: string;
    amount: number;
}