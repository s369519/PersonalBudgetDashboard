type SummaryCardProps = {
    title: string;
    value: string;
};

export default function SummaryCard({
    title,
    value,
}: SummaryCardProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-md border border-slate-200">
            <h2 className="text-sm font-medium text-slate-500">
                {title}
            </h2>

            <p className="mt-3 text-3xl font-bold text-slate-800">
                {value}
            </p>
        </div>
    );
}