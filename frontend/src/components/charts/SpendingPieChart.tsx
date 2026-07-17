import {
    Cell,
    Bar,
    BarChart,
    CartesianGrid,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { CategorySpending } from "../../types/dashboard";

type Props = {
    data: CategorySpending[];
    mode?: "pie" | "bar";
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK",
        maximumFractionDigits: 0,
    }).format(amount);
}

function categoryColor(index: number) {
    const hue = Math.round((index * 137.508 + 215) % 360);
    return `hsl(${hue} 62% 74%)`;
}

export default function SpendingPieChart({ data, mode = "pie" }: Props) {
    const sortedData = [...data].sort((a, b) => b.amount - a.amount);
    const total = sortedData.reduce((sum, item) => sum + item.amount, 0);
    const chartData = sortedData.map((item, index) => ({
        ...item,
        color: categoryColor(index),
        percentage: total === 0 ? 0 : item.amount / total * 100,
    }));

    return (
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(460px,1.3fr)_minmax(260px,0.7fr)]">
            <div className="relative mx-auto h-[430px] w-full max-w-[680px]">
                {mode === "pie" ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="amount"
                            nameKey="category"
                            innerRadius="62%"
                            outerRadius="88%"
                            paddingAngle={2}
                            cornerRadius={5}
                            stroke="none"
                            isAnimationActive
                            animationDuration={650}
                        >
                            {chartData.map((item) => (
                                <Cell
                                    key={item.category}
                                    fill={item.color}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                            contentStyle={{
                                borderRadius: "0.75rem",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 10px 25px rgb(15 23 42 / 0.1)",
                            }}
                        />
                    </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 8, right: 24, bottom: 8, left: 12 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke="#e2e8f0"
                            />
                            <XAxis
                                type="number"
                                tickFormatter={(value) =>
                                    new Intl.NumberFormat("nb-NO", {
                                        notation: "compact",
                                    }).format(Number(value))
                                }
                                tick={{ fontSize: 11, fill: "#64748b" }}
                            />
                            <YAxis
                                type="category"
                                dataKey="category"
                                width={195}
                                tick={{ fontSize: 11, fill: "#475569" }}
                            />
                            <Tooltip
                                formatter={(value) => formatCurrency(Number(value))}
                                contentStyle={{
                                    borderRadius: "0.75rem",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 10px 25px rgb(15 23 42 / 0.1)",
                                }}
                            />
                            <Bar
                                dataKey="amount"
                                name="Spent"
                                radius={[0, 6, 6, 0]}
                                isAnimationActive
                                animationDuration={650}
                            >
                                {chartData.map((item) => (
                                    <Cell key={item.category} fill={item.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {mode === "pie" && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Total spent
                    </span>
                    <span className="mt-2 text-2xl font-bold text-slate-900">
                        {formatCurrency(total)}
                    </span>
                    </div>
                )}
            </div>

            <div className="max-h-[430px] space-y-1 overflow-y-auto pr-2">
                {chartData.map((item) => (
                    <div
                        key={item.category}
                        className="group rounded-lg px-3 py-3 transition hover:bg-slate-50"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                                <span
                                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium leading-5 text-slate-700">
                                    {item.category}
                                </span>
                            </div>
                            <div className="shrink-0 text-right text-xs">
                                <span className="block font-semibold text-slate-900">
                                    {formatCurrency(item.amount)}
                                </span>
                                <span className="mt-0.5 block text-slate-400">
                                    {item.percentage.toFixed(1)} %
                                </span>
                            </div>
                        </div>

                        <div className="ml-6 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${item.percentage}%`,
                                    backgroundColor: item.color,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
