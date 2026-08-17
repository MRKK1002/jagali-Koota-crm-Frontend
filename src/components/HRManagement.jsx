import { Outlet } from "react-router-dom";

// src/components/HRManagement.js
const HRManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">HR & Management</h1>
   <Outlet/>
  </div>
);

export default HRManagement;
