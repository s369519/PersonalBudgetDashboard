import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import api from "../api/client";
import { getApiErrorMessage } from "../utils/getApiError";
import type { MonthlyTrend } from "../types/dashboard";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK",
        maximumFractionDigits: 0,
    }).format(amount);
}

function shortCurrency(amount: number) {
    return new Intl.NumberFormat("nb-NO", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(amount);
}

export default function Trends() {
    const [months, setMonths] = useState(12);
    const [data, setData] = useState<MonthlyTrend[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTrends() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.get<MonthlyTrend[]>(
                    `/Dashboard/trends?months=${months}`,
                );
                setData(response.data);
            } catch (requestError) {
                setError(getApiErrorMessage(
                    requestError,
                    "Could not load financial trends.",
                ));
            } finally {
                setIsLoading(false);
            }
        }

        loadTrends();
    }, [months]);

    const chartData = useMemo(() => data.map((item) => ({
        ...item,
        label: new Intl.DateTimeFormat("nb-NO", {
            month: "short",
            year: "2-digit",
        }).format(new Date(`${item.month}T00:00:00`)),
    })), [data]);

    const summary = useMemo(() => {
        if (data.length === 0) {
            return { averageIncome: 0, averageExpenses: 0, totalNet: 0, savingsRate: 0 };
        }

        const income = data.reduce((sum, item) => sum + item.income, 0);
        const expenses = data.reduce((sum, item) => sum + item.expenses, 0);
        const net = income - expenses;

        return {
            averageIncome: income / data.length,
            averageExpenses: expenses / data.length,
            totalNet: net,
            savingsRate: income === 0 ? 0 : net / income * 100,
        };
    }, [data]);

    return (
        <div className="mx-auto max-w-7xl">
            <header className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Trends</h1>
                    <p className="mt-2 text-slate-500">
                        Follow income, spending and savings over time.
                    </p>
                </div>
                <select
                    value={months}
                    onChange={(event) => setMonths(Number(event.target.value))}
                    aria-label="Trend period"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5"
                >
                    <option value={6}>Last 6 months</option>
                    <option value={12}>Last 12 months</option>
                    <option value={24}>Last 24 months</option>
                </select>
            </header>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    ["Average income", formatCurrency(summary.averageIncome)],
                    ["Average expenses", formatCurrency(summary.averageExpenses)],
                    ["Total net", formatCurrency(summary.totalNet)],
                    ["Savings rate", `${summary.savingsRate.toFixed(1)} %`],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                    </div>
                ))}
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Monthly cash flow
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Income and expenses are bars; net result is the line.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex h-96 items-center justify-center text-slate-500">
                        Loading trends...
                    </div>
                ) : (
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={shortCurrency} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                <Line dataKey="net" name="Net" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h2 className="font-semibold text-slate-900">Monthly details</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-sm text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Month</th>
                                <th className="px-4 py-3 text-right font-medium">Income</th>
                                <th className="px-4 py-3 text-right font-medium">Expenses</th>
                                <th className="px-4 py-3 text-right font-medium">Net</th>
                                <th className="px-6 py-3 text-right font-medium">Savings rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...chartData].reverse().map((item) => (
                                <tr key={item.month} className="border-t border-slate-100">
                                    <td className="px-6 py-4 font-medium text-slate-800">{item.label}</td>
                                    <td className="px-4 py-4 text-right text-emerald-700">{formatCurrency(item.income)}</td>
                                    <td className="px-4 py-4 text-right text-rose-700">{formatCurrency(item.expenses)}</td>
                                    <td className={`px-4 py-4 text-right font-medium ${item.net >= 0 ? "text-blue-700" : "text-red-700"}`}>
                                        {formatCurrency(item.net)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-600">{item.savingsRate.toFixed(1)} %</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
