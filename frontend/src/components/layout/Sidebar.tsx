import {
    LayoutDashboard,
    ReceiptText,
    WalletCards,
    Tags,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigationItems = [
    {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
    },
    {
        name: "Transactions",
        path: "/transactions",
        icon: ReceiptText,
    },
    {
        name: "Accounts",
        path: "/accounts",
        icon: WalletCards,
    },
    {
        name: "Categories",
        path: "/categories",
        icon: Tags,
    },
];

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-800 bg-slate-950 text-white">
            <div className="flex h-20 items-center border-b border-slate-800 px-6">
                <div>
                    <p className="text-lg font-bold">
                        Budget
                    </p>

                    <p className="text-xs text-slate-400">
                        Finance Dashboard
                    </p>
                </div>
            </div>

            <nav className="space-y-2 p-4">
                {navigationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                [
                                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-300 hover:bg-slate-900 hover:text-white",
                                ].join(" ")
                            }
                        >
                            <Icon size={20} />

                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}