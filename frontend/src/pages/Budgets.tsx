import { useEffect, useMemo, useState } from "react";
import { Copy, FilePlus2, Plus, Save, Trash2 } from "lucide-react";
import api from "../api/client";
import { getApiErrorMessage } from "../utils/getApiError";
import type {
    BudgetItemType,
    BudgetSheet,
    BudgetVisibility,
    SaveBudgetSheet,
} from "../types/budget";
import type { Category } from "../types/category";

type DraftRow = {
    key: string;
    description: string;
    type: BudgetItemType;
    amount: number;
    categoryId: string | null;
    actualAmount: number;
};

type Draft = {
    id: string | null;
    name: string;
    month: string;
    visibility: BudgetVisibility;
    rows: DraftRow[];
    actualIncome: number;
    actualExpenses: number;
    actualRemaining: number;
};

function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}

function newRow(type: BudgetItemType = "Expense"): DraftRow {
    return {
        key: crypto.randomUUID(),
        description: "",
        type,
        amount: 0,
        categoryId: null,
        actualAmount: 0,
    };
}

function emptyDraft(): Draft {
    return {
        id: null,
        name: "Monthly budget",
        month: currentMonth(),
        visibility: "Personal",
        rows: [newRow("Income"), newRow("Expense")],
        actualIncome: 0,
        actualExpenses: 0,
        actualRemaining: 0,
    };
}

function nextMonth(month: string) {
    const [year, monthNumber] = month.split("-").map(Number);
    const date = new Date(Date.UTC(year, monthNumber, 1));
    return date.toISOString().slice(0, 7);
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK",
        maximumFractionDigits: 0,
    }).format(amount);
}

function toDraft(sheet: BudgetSheet): Draft {
    return {
        id: sheet.id,
        name: sheet.name,
        month: sheet.month.slice(0, 7),
        visibility: sheet.visibility,
        rows: sheet.items.map((item) => ({
            key: item.id,
            description: item.description,
            type: item.type,
            amount: item.amount,
            categoryId: item.categoryId,
            actualAmount: item.actualAmount,
        })),
        actualIncome: sheet.actualIncome,
        actualExpenses: sheet.actualExpenses,
        actualRemaining: sheet.actualRemaining,
    };
}

export default function Budgets() {
    const [budgets, setBudgets] = useState<BudgetSheet[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [draft, setDraft] = useState<Draft>(emptyDraft);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadBudgets(preferredId?: string) {
        const response = await api.get<BudgetSheet[]>("/Budgets");
        setBudgets(response.data);

        const selected = response.data.find(
            (budget) => budget.id === (preferredId ?? draft.id),
        );

        if (selected) {
            setDraft(toDraft(selected));
        }
    }

    useEffect(() => {
        async function load() {
            try {
                setError(null);
                const [budgetsResponse, categoriesResponse] = await Promise.all([
                    api.get<BudgetSheet[]>("/Budgets"),
                    api.get<Category[]>("/Categories"),
                ]);
                setBudgets(budgetsResponse.data);
                setCategories(categoriesResponse.data);
                if (budgetsResponse.data.length > 0) {
                    setDraft(toDraft(budgetsResponse.data[0]));
                }
            } catch (requestError) {
                setError(getApiErrorMessage(
                    requestError,
                    "Could not load budgets.",
                ));
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, []);

    const totals = useMemo(() => {
        const income = draft.rows
            .filter((row) => row.type === "Income")
            .reduce((sum, row) => sum + (row.amount || 0), 0);
        const expenses = draft.rows
            .filter((row) => row.type === "Expense")
            .reduce((sum, row) => sum + (row.amount || 0), 0);
        return { income, expenses, remaining: income - expenses };
    }, [draft.rows]);

    function updateRow(key: string, changes: Partial<DraftRow>) {
        setDraft((current) => ({
            ...current,
            rows: current.rows.map((row) =>
                row.key === key ? { ...row, ...changes } : row,
            ),
        }));
    }

    async function handleSave() {
        const validRows = draft.rows.filter(
            (row) => row.description.trim() && row.amount > 0,
        );

        if (!draft.name.trim() || !draft.month) {
            setError("Enter a budget name and month.");
            return;
        }

        if (validRows.length !== draft.rows.length) {
            setError("Every row needs a description and amount greater than zero.");
            return;
        }

        const payload: SaveBudgetSheet = {
            name: draft.name.trim(),
            month: `${draft.month}-01`,
            visibility: draft.visibility,
            items: validRows.map((row) => ({
                description: row.description.trim(),
                type: row.type,
                amount: row.amount,
                categoryId: row.categoryId,
            })),
        };

        try {
            setIsSaving(true);
            setError(null);
            const response = draft.id
                ? await api.put<BudgetSheet>(`/Budgets/${draft.id}`, payload)
                : await api.post<BudgetSheet>("/Budgets", payload);
            await loadBudgets(response.data.id);
        } catch (requestError) {
            setError(getApiErrorMessage(
                requestError,
                "Could not save the budget.",
            ));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!draft.id || !window.confirm(`Delete "${draft.name}"?`)) return;

        try {
            await api.delete(`/Budgets/${draft.id}`);
            const remaining = budgets.filter((item) => item.id !== draft.id);
            setBudgets(remaining);
            setDraft(remaining.length > 0 ? toDraft(remaining[0]) : emptyDraft());
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "Could not delete the budget."));
        }
    }

    function handleCopyAsNew() {
        setDraft((current) => ({
            ...current,
            id: null,
            name: `${current.name} copy`,
            month: nextMonth(current.month),
            rows: current.rows.map((row) => ({
                ...row,
                key: crypto.randomUUID(),
                actualAmount: 0,
            })),
            actualIncome: 0,
            actualExpenses: 0,
            actualRemaining: 0,
        }));
        setError(null);
    }

    if (isLoading) {
        return <div className="p-8 text-slate-500">Loading budgets...</div>;
    }

    return (
        <div className="mx-auto max-w-7xl">
            <header className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Budgets</h1>
                    <p className="mt-2 text-slate-500">
                        Create personal or shared monthly budget sheets.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setDraft(emptyDraft())}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
                >
                    <FilePlus2 size={18} /> New budget
                </button>
            </header>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
                <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Budget sheets
                    </p>
                    <div className="space-y-1">
                        {budgets.map((budget) => (
                            <button
                                key={budget.id}
                                type="button"
                                onClick={() => {
                                    setError(null);
                                    setDraft(toDraft(budget));
                                }}
                                className={`w-full rounded-lg px-3 py-3 text-left ${
                                    draft.id === budget.id
                                        ? "bg-blue-50 text-blue-800"
                                        : "hover:bg-slate-50"
                                }`}
                            >
                                <span className="block truncate font-medium">{budget.name}</span>
                                <span className="mt-1 block text-xs text-slate-500">
                                    {budget.month.slice(0, 7)} · {budget.visibility}
                                </span>
                            </button>
                        ))}
                        {budgets.length === 0 && (
                            <p className="px-3 py-6 text-center text-sm text-slate-400">
                                No budgets yet.
                            </p>
                        )}
                    </div>
                </aside>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className={`border-b px-5 py-2 text-sm font-medium ${
                        draft.id
                            ? "border-blue-100 bg-blue-50 text-blue-700"
                            : "border-emerald-100 bg-emerald-50 text-emerald-700"
                    }`}>
                        {draft.id
                            ? "Editing an existing budget — saving will update this sheet."
                            : "Creating a new budget sheet."}
                    </div>

                    {draft.rows.some((row) => !row.categoryId) && (
                        <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
                            Actual amounts require a category. Select the matching CSV category for each row and save the budget. The budget month must also match the CSV month.
                        </div>
                    )}

                    <div className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-[1fr_180px_170px]">
                        <input
                            value={draft.name}
                            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                            aria-label="Budget name"
                            className="rounded-lg border border-slate-300 px-3 py-2 font-semibold outline-none focus:border-blue-500"
                        />
                        <input
                            type="month"
                            value={draft.month}
                            onChange={(event) => setDraft({ ...draft, month: event.target.value })}
                            aria-label="Budget month"
                            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <select
                            value={draft.visibility}
                            onChange={(event) => setDraft({
                                ...draft,
                                visibility: event.target.value as BudgetVisibility,
                            })}
                            aria-label="Budget visibility"
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
                        >
                            <option value="Personal">Personal</option>
                            <option value="Shared">Shared</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Description</th>
                                    <th className="w-40 px-3 py-3">Type</th>
                                    <th className="w-48 px-3 py-3">Category</th>
                                    <th className="w-40 px-3 py-3 text-right">Budgeted</th>
                                    <th className="w-36 px-3 py-3 text-right">Actual</th>
                                    <th className="w-36 px-3 py-3 text-right">Difference</th>
                                    <th className="w-16 px-3 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {draft.rows.map((row) => (
                                    <tr key={row.key} className="border-t border-slate-100">
                                        <td className="p-3 pl-5">
                                            <input
                                                value={row.description}
                                                onChange={(event) => updateRow(row.key, { description: event.target.value })}
                                                placeholder={row.type === "Income" ? "Salary" : "Rent, food, savings..."}
                                                className="w-full rounded-md border border-transparent px-2 py-2 outline-none hover:border-slate-200 focus:border-blue-500"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <select
                                                value={row.type}
                                                onChange={(event) => updateRow(row.key, {
                                                    type: event.target.value as BudgetItemType,
                                                })}
                                                className="w-full rounded-md border border-slate-200 bg-white px-2 py-2"
                                            >
                                                <option value="Income">Income</option>
                                                <option value="Expense">Expense</option>
                                            </select>
                                        </td>
                                        <td className="p-3">
                                            <select
                                                value={row.categoryId ?? ""}
                                                onChange={(event) => updateRow(row.key, {
                                                    categoryId: event.target.value || null,
                                                    actualAmount: 0,
                                                })}
                                                className="w-full rounded-md border border-slate-200 bg-white px-2 py-2"
                                            >
                                                <option value="">No category</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={row.amount}
                                                onChange={(event) => updateRow(row.key, { amount: Number(event.target.value) })}
                                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-right"
                                            />
                                        </td>
                                        <td className="p-3 text-right font-medium text-slate-700">
                                            {row.categoryId
                                                ? formatCurrency(row.actualAmount)
                                                : "—"}
                                        </td>
                                        <td className={`p-3 text-right font-medium ${
                                            (row.type === "Expense"
                                                ? row.amount - row.actualAmount
                                                : row.actualAmount - row.amount) >= 0
                                                ? "text-emerald-700"
                                                : "text-red-700"
                                        }`}>
                                            {row.categoryId
                                                ? formatCurrency(
                                                    row.type === "Expense"
                                                        ? row.amount - row.actualAmount
                                                        : row.actualAmount - row.amount,
                                                )
                                                : "—"}
                                        </td>
                                        <td className="p-3">
                                            <button
                                                type="button"
                                                onClick={() => setDraft({
                                                    ...draft,
                                                    rows: draft.rows.filter((item) => item.key !== row.key),
                                                })}
                                                aria-label="Remove row"
                                                className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-200 p-5">
                        <button
                            type="button"
                            onClick={() => setDraft({ ...draft, rows: [...draft.rows, newRow()] })}
                            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            <Plus size={17} /> Add row
                        </button>
                    </div>

                    <div className="grid gap-4 border-t border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
                        <div>
                            <p className="text-xs uppercase text-slate-500">Income</p>
                            <p className="mt-1 text-lg font-semibold text-emerald-700">{formatCurrency(totals.income)}</p>
                            <p className="mt-1 text-xs text-slate-500">Actual {formatCurrency(draft.actualIncome)}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-slate-500">Expenses</p>
                            <p className="mt-1 text-lg font-semibold text-rose-700">{formatCurrency(totals.expenses)}</p>
                            <p className="mt-1 text-xs text-slate-500">Actual {formatCurrency(draft.actualExpenses)}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-slate-500">Remaining</p>
                            <p className={`mt-1 text-lg font-semibold ${totals.remaining >= 0 ? "text-blue-700" : "text-red-700"}`}>
                                {formatCurrency(totals.remaining)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Actual {formatCurrency(draft.actualRemaining)}</p>
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 border-t border-slate-200 p-5">
                        <div className="flex gap-2">
                            {draft.id && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleCopyAsNew}
                                        className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-blue-600 hover:bg-blue-50"
                                    >
                                        <Copy size={17} /> Copy as new
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="rounded-lg px-4 py-2.5 font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Delete budget
                                    </button>
                                </>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            <Save size={18} /> {isSaving
                                ? "Saving..."
                                : draft.id
                                    ? "Save changes"
                                    : "Create budget"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
