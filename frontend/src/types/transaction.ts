export type Transaction = {
    id: string;
    description: string;
    amount: number;
    date: string;
    accountName: string;
    categoryName: string;
};

export type CreateTransaction = {
    description: string;
    amount: number;
    date: string;
    accountId: string;
    categoryId: string;
};

export type UpdateTransaction = CreateTransaction;