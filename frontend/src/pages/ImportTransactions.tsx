import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileSpreadsheet, UploadCloud, X } from "lucide-react";
import api from "../api/client";
import { getApiErrorMessage } from "../utils/getApiError";
import type { Account } from "../types/account";
import type {
    BankCsvImportResult,
    BankCsvPreview,
} from "../types/import";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK",
    }).format(amount);
}

export default function ImportTransactions() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [accountId, setAccountId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<BankCsvPreview | null>(null);
    const [result, setResult] = useState<BankCsvImportResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAccounts() {
            try {
                const response = await api.get<Account[]>("/Accounts");
                const personalAccounts = response.data.filter(
                    (account) => account.visibility === "Personal",
                );
                setAccounts(personalAccounts);
                setAccountId(personalAccounts[0]?.id ?? "");
            } catch (requestError) {
                setError(getApiErrorMessage(
                    requestError,
                    "Could not load personal accounts.",
                ));
            }
        }

        loadAccounts();
    }, []);

    async function selectFile(selectedFile: File) {
        if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
            setError("Select a CSV file.");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setResult(null);
            const formData = new FormData();
            formData.append("file", selectedFile);
            const response = await api.post<BankCsvPreview>(
                "/Imports/bank-csv/preview",
                formData,
            );
            setFile(selectedFile);
            setPreview(response.data);
        } catch (requestError) {
            setFile(null);
            setPreview(null);
            setError(getApiErrorMessage(
                requestError,
                "The CSV file could not be read.",
            ));
        } finally {
            setIsLoading(false);
        }
    }

    async function handleImport() {
        if (!file || !accountId) {
            setError("Select a CSV file and a personal account.");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("accountId", accountId);
            const response = await api.post<BankCsvImportResult>(
                "/Imports/bank-csv",
                formData,
            );
            setResult(response.data);
            setFile(null);
            setPreview(null);
        } catch (requestError) {
            setError(getApiErrorMessage(
                requestError,
                "The transactions could not be imported.",
            ));
        } finally {
            setIsLoading(false);
        }
    }

    function clearFile() {
        setFile(null);
        setPreview(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    return (
        <div className="mx-auto max-w-6xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">CSV import</h1>
                <p className="mt-2 text-slate-500">
                    Import a monthly bank report to a personal account.
                </p>
            </header>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {result && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
                    <CheckCircle2 className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold">Import completed</p>
                        <p className="mt-1 text-sm">
                            {result.importedTransactions} transactions and {result.createdCategories} new categories were added for {result.month.slice(0, 7)}.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-6">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <label htmlFor="import-account" className="mb-2 block text-sm font-medium text-slate-700">
                            Personal account
                        </label>
                        <select
                            id="import-account"
                            value={accountId}
                            onChange={(event) => setAccountId(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
                        >
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>{account.name}</option>
                            ))}
                        </select>
                        {accounts.length === 0 && (
                            <p className="mt-3 text-sm text-amber-700">
                                Create a personal account before importing.
                            </p>
                        )}
                    </section>

                    <section
                        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                        onDragOver={(event) => event.preventDefault()}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setIsDragging(false);
                            const droppedFile = event.dataTransfer.files[0];
                            if (droppedFile) selectFile(droppedFile);
                        }}
                        className={`rounded-xl border-2 border-dashed bg-white p-7 text-center transition ${
                            isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300"
                        }`}
                    >
                        <UploadCloud className="mx-auto text-slate-400" size={38} />
                        <p className="mt-4 font-medium text-slate-800">Drop your CSV file here</p>
                        <p className="mt-1 text-sm text-slate-500">ISO-8859-1 bank report, maximum 5 MB</p>
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={(event) => {
                                const selectedFile = event.target.files?.[0];
                                if (selectedFile) selectFile(selectedFile);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={isLoading}
                            className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {isLoading ? "Reading file..." : "Choose file"}
                        </button>
                    </section>
                </div>

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    {!preview ? (
                        <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center text-slate-400">
                            <FileSpreadsheet size={44} />
                            <p className="mt-4">Upload a file to preview transactions and categories.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-start justify-between border-b border-slate-200 p-5">
                                <div>
                                    <h2 className="font-semibold text-slate-900">{file?.name}</h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Month {preview.month.slice(0, 7)} · all rows receive date {preview.transactionDate}
                                    </p>
                                </div>
                                <button type="button" onClick={clearFile} aria-label="Remove file" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                                    <X size={19} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-b border-slate-200 bg-slate-50 p-5 text-sm">
                                <div><p className="text-slate-500">Rows</p><p className="mt-1 font-semibold">{preview.rowCount}</p></div>
                                <div><p className="text-slate-500">Income</p><p className="mt-1 font-semibold text-emerald-700">{formatCurrency(preview.totalIncome)}</p></div>
                                <div><p className="text-slate-500">Expenses</p><p className="mt-1 font-semibold text-rose-700">{formatCurrency(preview.totalExpenses)}</p></div>
                            </div>

                            <div className="max-h-[430px] overflow-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-white text-slate-500 shadow-sm">
                                        <tr><th className="px-5 py-3 font-medium">Description</th><th className="px-3 py-3 font-medium">Category</th><th className="px-5 py-3 text-right font-medium">Amount</th></tr>
                                    </thead>
                                    <tbody>
                                        {preview.rows.map((row, index) => (
                                            <tr key={`${row.description}-${index}`} className="border-t border-slate-100">
                                                <td className="px-5 py-3 text-slate-800">{row.description}</td>
                                                <td className="px-3 py-3 text-slate-600">{row.category}</td>
                                                <td className={`px-5 py-3 text-right font-medium ${row.amount >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatCurrency(row.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between gap-4 border-t border-slate-200 p-5">
                                <p className="text-xs text-slate-500">
                                    {preview.categories.length} categories will be reused or created automatically. Duplicate files are rejected.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleImport}
                                    disabled={isLoading || !accountId}
                                    className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {isLoading ? "Importing..." : `Import ${preview.rowCount} rows`}
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
