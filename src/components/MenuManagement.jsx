import { Outlet } from "react-router-dom";

const MenuManagement = () => (
  <div className="p-6" style={{ backgroundColor: "#FCFCFC", minHeight: "100%" }}>
    <Outlet />
  </div>
);

export default MenuManagement;
