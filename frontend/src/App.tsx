import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import AppLayout from "./components/layout/AppLayout";

import Accounts from "./pages/Accounts";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transactions from "./pages/Transactions";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<AppLayout />}>
                            <Route
                                path="/"
                                element={<Dashboard />}
                            />

                            <Route
                                path="/transactions"
                                element={<Transactions />}
                            />

                            <Route
                                path="/accounts"
                                element={<Accounts />}
                            />

                            <Route
                                path="/categories"
                                element={<Categories />}
                            />
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}