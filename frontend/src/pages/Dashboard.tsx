import { useEffect, useState } from "react";
import api from "../api/client";
import type {
    DashboardSummary,
    CategorySpending
} from "../types/dashboard";


export default function Dashboard()
{
    const [summary, setSummary] =
        useState<DashboardSummary | null>(null);


    const [categories, setCategories] =
        useState<CategorySpending[]>([]);



    useEffect(() => {

        api.get("/Dashboard/summary")
            .then(response =>
            {
                setSummary(response.data);
            });


        api.get("/Dashboard/categories")
            .then(response =>
            {
                setCategories(response.data);
            });


    }, []);



    return (
        <div>

            <h1>
                Personal Finance Dashboard
            </h1>


            {summary &&
            (
                <div>

                    <h2>
                        Balance:
                        {summary.totalBalance} kr
                    </h2>


                    <p>
                        Income:
                        {summary.monthlyIncome}
                    </p>


                    <p>
                        Expenses:
                        {summary.monthlyExpenses}
                    </p>


                </div>
            )}



            <h2>
                Categories
            </h2>


            {
                categories.map(category =>
                (
                    <div key={category.category}>

                        {category.category}
                        :
                        {category.amount} kr

                    </div>
                ))
            }

        </div>
    );
}