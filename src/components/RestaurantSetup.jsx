import { Outlet } from "react-router-dom";

// src/components/RestaurantSetup.js
export const RestaurantSetup = () => (
  <div className="p-0">
    {/* <h1 className="text-2xl font-bold mb-4">Restaurant Setup</h1>
    <div className="bg-white p-6 rounded-lg shadow-md">
      <p className="text-gray-700">
        Configure your restaurant settings, location, and basic information.
      </p>
    </div> */}
    <Outlet />
  </div>
);

export default RestaurantSetup;
