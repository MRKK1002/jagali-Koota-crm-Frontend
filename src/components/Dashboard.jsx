// src/components/Dashboard.js
import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user, crmType } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Welcome to{" "}
        {crmType
          ? `${crmType.charAt(0).toUpperCase() + crmType.slice(1)} CRM`
          : "CRM"}{" "}
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Overview</h2>
          <p className="mt-2 text-gray-600">
            Dashboard content specific to {crmType || "Common"} CRM
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <p className="mt-2 text-gray-600">
            Recent activities will appear here
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Statistics</h2>
          <p className="mt-2 text-gray-600">Key metrics and statistics</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
