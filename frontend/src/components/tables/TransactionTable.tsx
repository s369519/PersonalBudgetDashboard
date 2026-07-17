import { Pencil, Trash2 } from "lucide-react";

import type { Transaction } from "../../types/transaction";

type TransactionTableProps = {
    transactions: Transaction[];
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (transaction: Transaction) => Promise<void>;
    deletingId?: string | null;
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("nb-NO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

export default function TransactionTable({
    transactions,
    onEdit,
    onDelete,
    deletingId,
}: TransactionTableProps) {
    const showActions = onEdit || onDelete;

    if (transactions.length === 0) {
        return (
            <div className="flex h-72 items-center justify-center text-slate-500">
                No transactions found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="pb-3 font-medium">Description</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 text-right font-medium">
                            Amount
                        </th>

                        {showActions && (
                            <th className="w-24 pb-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {transactions.map((transaction) => (
                        <tr
                            key={transaction.id}
                            className="border-b border-slate-100 last:border-b-0"
                        >
                            <td className="py-4">
                                <div className="font-medium text-slate-800">
                                    {transaction.description}
                                </div>

                                <div className="text-sm text-slate-500">
                                    {transaction.accountName ||
                                        "Unknown account"}
                                </div>
                            </td>

                            <td className="py-4 text-slate-600">
                                {transaction.categoryName || "Uncategorized"}
                            </td>

                            <td className="py-4 text-slate-600">
                                {formatDate(transaction.date)}
                            </td>

                            <td
                                className={`py-4 text-right font-semibold ${
                                    transaction.amount >= 0
                                        ? "text-emerald-600"
                                        : "text-rose-600"
                                }`}
                            >
                                {transaction.amount > 0 ? "+" : ""}
                                {formatCurrency(transaction.amount)}
                            </td>

                            {showActions && (
                                <td className="py-4 pl-4">
                                    <div className="flex justify-end gap-1">
                                        {onEdit && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onEdit(transaction)
                                                }
                                                aria-label={`Edit ${transaction.description}`}
                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        )}

                                        {onDelete && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDelete(transaction)
                                                }
                                                disabled={
                                                    deletingId ===
                                                    transaction.id
                                                }
                                                aria-label={`Delete ${transaction.description}`}
                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}