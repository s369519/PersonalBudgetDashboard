import {
    LayoutDashboard,
    LogOut,
    ReceiptText,
    Tags,
    WalletCards,
    TableProperties,
    TrendingUp,
} from "lucide-react";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

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
        name: "Trends",
        path: "/trends",
        icon: TrendingUp,
    },
    {
        name: "Budgets",
        path: "/budgets",
        icon: TableProperties,
    },
    {
        name: "Categories",
        path: "/categories",
        icon: Tags,
    },
];

export default function Sidebar() {
    const navigate = useNavigate();

    const {
        user,
        logout,
    } = useAuth();

    function handleLogout() {
        logout();

        navigate("/login", {
            replace: true,
        });
    }

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
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

            <nav className="flex-1 space-y-2 p-4">
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

            <div className="border-t border-slate-800 p-4">
                <div className="mb-4 px-2">
                    <p className="truncate text-sm font-medium text-white">
                        {user?.displayName}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                        {user?.email}
                    </p>

                    <p className="mt-2 truncate text-xs text-slate-500">
                        Household code: {user?.householdCode}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
                >
                    <LogOut size={20} />

                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
