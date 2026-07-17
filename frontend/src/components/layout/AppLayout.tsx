import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />

            <main className="ml-64 min-h-screen p-6 md:p-10">
                <Outlet />
            </main>
        </div>
    );
}