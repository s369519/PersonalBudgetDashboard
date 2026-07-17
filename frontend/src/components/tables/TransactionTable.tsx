import type { Transaction } from "../../types/transaction";

type TransactionTableProps = {
    transactions: Transaction[];
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
}: TransactionTableProps) {
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
                                    {transaction.accountName || "Unknown account"}
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}