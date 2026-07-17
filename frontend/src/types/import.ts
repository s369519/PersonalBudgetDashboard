export type BankCsvRow = {
    description: string;
    category: string;
    topCategory: string;
    amount: number;
};

export type BankCsvPreview = {
    month: string;
    transactionDate: string;
    rowCount: number;
    totalIncome: number;
    totalExpenses: number;
    categories: string[];
    rows: BankCsvRow[];
};

export type BankCsvImportResult = {
    month: string;
    importedTransactions: number;
    createdCategories: number;
};
