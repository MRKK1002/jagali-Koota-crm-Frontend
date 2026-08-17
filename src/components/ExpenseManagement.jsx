import { Outlet } from "react-router-dom";

// src/components/ExpenseManagement.js
const ExpenseManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Expense Management</h1>
      <Outlet/>
  </div>
);

export default ExpenseManagement;
