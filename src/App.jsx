import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";

// Restaurant
import RestaurantDashboard from "./components/RestaurantDashboard";
import RestaurantSetup from "./components/RestaurantSetup";
import MenuManagement from "./components/MenuManagement";
import RestaurantStockManagement from "./components/StockManagement";
import PurchaseManagement from "./components/PurchaseManagement";
import OrderBilling from "./components/OrderBilling";
import CustomerManagement from "./components/CustomerManagement";
import ReservationsManagement from "./components/ReservationsManagement";
import KitchenManagement from "./components/KitchenManagement";
import HRManagement from "./components/HRManagement";
import RestaurantExpenseManagement from "./components/ExpenseManagement";
import FinanceAccounts from "./components/FinanceAccounts";
import SubAdmin from "./components/SubAdmin";
import ReportsAnalytics from "./components/ReportsAnalytics";
import JagaliKootaDashboard from "./components/JagaliKoota/JagaliKootaDashboard";
  // import PurchaseOrder from "./components/PurchaseOrder/PurchaseOrder";
import CategoryManagement from "./components/MenuManagement/CategoryManagement";
import MenuManagements from "./components/MenuManagement/MenuManagements";
// import HotelGRMSystem from "./components/PurchaseOrder/HotelGRMSystem";
import SupplierLedger from "./components/Finance & Accounts/SupplierLedger";
import VendorPaymentTracking from "./components/PurchaseOrder/VendorPaymentTracking";
import ResInventory from "./components/MenuManagement/ResInventory";
import RecipeRequirement from "./components/MenuManagement/RecipeRequirement";
import RecipeManagement from "./components/MenuManagement/RecipeRequirement";
import SalesReport from "./components/Report Analytics/SalesReport";
import ItemSalesReport from "./components/Report Analytics/ItemSalesReport";
import PurchasesvsSalesvsExpenses from "./components/Report Analytics/PurchasevsSalesvsExpenses";
// import ResSupplier from "./components/Common/ResSupplier";
// import StoreLocation from "./components/PurchaseOrder/StoreLocation";
import StoreLocation from "./components/StoreLocation";
import TableSetup from "./components/Restaurant-setup/TableSetup";
import TableReservation from "./components/Restaurant-setup/TableReservation";
import RestaurantProfile from "./components/Restaurant-setup/RestaurantProfile";
import RestaurantConfig from "./components/Restaurant-setup/RestaurantConfig";
import CurrentBills from "./components/Order & Billing/CurrentBills";
import ExpenseHeadMaster from "./components/ExpenseManagement/ExpenseHeadMaster";
import EmployeeRegistrationForm from "./components/HRMS/EmployeeRegistrationForm";
import AttendanceMasterPage from "./components/HRMS/AttendanceMasterPage";
import AttendancePage from "./components/HRMS/AttendancePage";
import GenerateSalarySlip from "./components/HRMS/GenerateSalarySlip";
import GeoAttendanceMonitoring from "./components/HRMS/GeoAttendanceMonitoring";
import HRMSIndex from "./components/HRMS/HRMSIndex";
import ShiftManagement from "./components/HRMS/ShiftManagement";
import RestaurantInventoryManagement from "./components/InventoryManagement";
import InventoryDistribution from "./components/InventoryDistribution";
import IndentManagement from "./components/IndentManagement";
import RecipeMaster from "./components/RecipeMaster";
import DepartmentStock from "./components/DepartmentStock";
import Branches from "./components/MenuManagement/Branches";
import Orders from "./components/Order & Billing/Orders";
import StaffOrders from "./components/Order & Billing/StaffOrders";
import CounterOrders from "./components/Order & Billing/CounterOrders";
import Payments from "./components/Order & Billing/Payments";
import StaffPayment from "./components/Order & Billing/StaffPayment";
import CounterPayment from "./components/Order & Billing/CounterPayment";

// Admin
import ModuleAccessManagement from "./components/Admin/ModuleAccessManagement";
import UserManagement from "./components/Admin/UserManagement";
import RestaurantUserManagement from "./components/Admin/RestaurantUserManagement";



function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/:crmType" element={<Login />} />

          {/* ── Restaurant Routes ── */}
          <Route
            path="/restaurant/dashboard"
            element={<ProtectedRoute><Layout><RestaurantDashboard /></Layout></ProtectedRoute>}
          />

          {/* Restaurant Setup - commented out, not required */}
          {/* <Route
            path="/restaurant/setup"
            element={<ProtectedRoute><Layout><RestaurantSetup /></Layout></ProtectedRoute>}
          >
            <Route path="table-setup" element={<TableSetup />} />
            <Route path="Table-Setup" element={<TableSetup />} />
            <Route path="restaurant-profile" element={<RestaurantProfile />} />
          </Route>
          <Route
            path="/restaurant/setup/:subPath"
            element={<ProtectedRoute><Layout><RestaurantSetup /></Layout></ProtectedRoute>}
          /> */}

          <Route
            path="/restaurant/menu"
            element={<ProtectedRoute><Layout><MenuManagement /></Layout></ProtectedRoute>}
          >
            <Route path="category" element={<CategoryManagement />} />
            <Route path="menu" element={<MenuManagements />} />
            <Route path="inventory" element={<ResInventory />} />
            <Route path="branch" element={<Branches />} />
            <Route path="recipe-management" element={<RecipeManagement />} />
          </Route>
          <Route
            path="/restaurant/menu/:subPath"
            element={<ProtectedRoute><Layout><MenuManagement /></Layout></ProtectedRoute>}
          />

          <Route
            path="/restaurant/stock"
            element={<ProtectedRoute><Layout><RestaurantStockManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/stock/:subPath"
            element={<ProtectedRoute><Layout><RestaurantStockManagement /></Layout></ProtectedRoute>}
          />

          <Route
            path="/restaurant/purchase/purchase-vendors"
            element={<ProtectedRoute><Layout><VendorPaymentTracking /></Layout></ProtectedRoute>}
          />
          {/* <Route
            path="/restaurant/purchase/store-location"
            element={<ProtectedRoute><Layout><StoreLocation /></Layout></ProtectedRoute>}
          /> */}
          <Route
            path="/restaurant/purchase/store-location"
            element={<ProtectedRoute><Layout><StoreLocation /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/purchase/:subPath"
            element={<ProtectedRoute><Layout><PurchaseManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/purchase"
            element={<ProtectedRoute><Layout><PurchaseManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/grn"
            element={<ProtectedRoute><Layout><PurchaseManagement /></Layout></ProtectedRoute>}
          />

          <Route
            path="/restaurant/billing"
            element={<ProtectedRoute><Layout><OrderBilling /></Layout></ProtectedRoute>}
          >
            <Route path="order-billing" element={<CurrentBills />} />
            <Route path="online-orders" element={<Orders />} />
            <Route path="darshini-orders" element={<CounterOrders />} />
            <Route path="restaurant-orders" element={<StaffOrders />} />
            <Route path="online-payments" element={<Payments />} />
            <Route path="darshini-payment" element={<CounterPayment />} />
            <Route path="restaurant-payment" element={<StaffPayment />} />
          </Route>
          <Route
            path="/restaurant/billing/:subPath"
            element={<ProtectedRoute><Layout><OrderBilling /></Layout></ProtectedRoute>}
          />

          <Route
            path="/restaurant/customers"
            element={<ProtectedRoute><Layout><CustomerManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/customers/:subPath"
            element={<ProtectedRoute><Layout><CustomerManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/reservations"
            element={<ProtectedRoute><Layout><ReservationsManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/kitchen"
            element={<ProtectedRoute><Layout><KitchenManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/kitchen/:subPath"
            element={<ProtectedRoute><Layout><KitchenManagement /></Layout></ProtectedRoute>}
          />

          <Route
            path="/restaurant/HRMS"
            element={<ProtectedRoute><Layout><HRManagement /></Layout></ProtectedRoute>}
          >
            <Route path="employee-registration" element={<EmployeeRegistrationForm />} />
            <Route path="geo-attendance" element={<GeoAttendanceMonitoring />} />
            <Route path="hrms-dashboard" element={<HRMSIndex />} />
            <Route path="attendance-master" element={<AttendanceMasterPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="generate-salary-slip" element={<GenerateSalarySlip />} />
            <Route path="shift-management" element={<ShiftManagement />} />
          </Route>
          <Route
            path="/restaurant/hr/:subPath"
            element={<ProtectedRoute><Layout><HRManagement /></Layout></ProtectedRoute>}
          />

          <Route
            path="/restaurant/inventory/inventory-management"
            element={<ProtectedRoute><Layout><RestaurantInventoryManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/inventory/inventory-distribution"
            element={<ProtectedRoute><Layout><InventoryDistribution /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/inventory/indent"
            element={<ProtectedRoute><Layout><IndentManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/menu/recipe-master"
            element={<ProtectedRoute><Layout><RecipeMaster /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/inventory/department-stock"
            element={<ProtectedRoute><Layout><DepartmentStock /></Layout></ProtectedRoute>}
          />

          <Route
            path="/restaurant/expenses"
            element={<ProtectedRoute><Layout><RestaurantExpenseManagement /></Layout></ProtectedRoute>}
          >
            <Route path="expense-head-master" element={<ExpenseHeadMaster />} />
          </Route>
          <Route
            path="/restaurant/expenses/:subPath"
            element={<ProtectedRoute><Layout><RestaurantExpenseManagement /></Layout></ProtectedRoute>}
          />

          <Route
            path="/restaurant/finance"
            element={<ProtectedRoute><Layout><FinanceAccounts /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/finance/supplierledger"
            element={<ProtectedRoute><Layout><SupplierLedger /></Layout></ProtectedRoute>}
          />

          <Route
            path="/restaurant/reports"
            element={<ProtectedRoute><Layout><ReportsAnalytics /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/jagali-koota"
            element={<ProtectedRoute><Layout><JagaliKootaDashboard /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/reports/salesreport"
            element={<ProtectedRoute><Layout><SalesReport /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/reports/itemsalesreport"
            element={<ProtectedRoute><Layout><ItemSalesReport /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/reports/purchasesalesreport"
            element={<ProtectedRoute><Layout><PurchasesvsSalesvsExpenses /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/subadmin"
            element={<ProtectedRoute><Layout><SubAdmin /></Layout></ProtectedRoute>}
          />
          <Route
            path="/restaurant/payroll"
            element={<ProtectedRoute><Layout><HRManagement /></Layout></ProtectedRoute>}
          />

          {/* ── Admin Routes ── */}
          <Route
            path="/admin/module-access"
            element={<ProtectedRoute><Layout><ModuleAccessManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute><Layout><UserManagement /></Layout></ProtectedRoute>}
          />
          <Route
            path="/admin/restaurant-users"
            element={<ProtectedRoute><Layout><RestaurantUserManagement /></Layout></ProtectedRoute>}
          />

          {/* ── Common CRM Routes ── */}
          {/* Common CRM Routes - commented out, not needed for Jagali Koota */}
          {/*
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboardc /></Layout></ProtectedRoute>} />
          <Route path="/common/crm" element={<ProtectedRoute><Layout><CRMManagement /></Layout></ProtectedRoute>} />
          <Route path="/common/sales" element={<ProtectedRoute><Layout><CommonSalesManagement /></Layout></ProtectedRoute>} />
          <Route path="/common/purchase" element={<ProtectedRoute><Layout><CommonPurchaseManagement /></Layout></ProtectedRoute>} />
          <Route path="/common/inventory" element={<ProtectedRoute><Layout><CommonInventory /></Layout></ProtectedRoute>} />
          <Route path="/common/hr" element={<ProtectedRoute><Layout><CRMHRManagement /></Layout></ProtectedRoute>} />
          <Route path="/common/attendance" element={<ProtectedRoute><Layout><CommonAttendance /></Layout></ProtectedRoute>} />
          <Route path="/common/payroll" element={<ProtectedRoute><Layout><CommonPayroll /></Layout></ProtectedRoute>} />
          <Route path="/common/accounts" element={<ProtectedRoute><Layout><AccountFinance /></Layout></ProtectedRoute>} />
          <Route path="/common/reports" element={<ProtectedRoute><Layout><ReportAnalytics /></Layout></ProtectedRoute>} />
          <Route path="/common/alerts" element={<ProtectedRoute><Layout><AlertsNotifications /></Layout></ProtectedRoute>} />
          <Route path="/common/security" element={<ProtectedRoute><Layout><SecurityRoles /></Layout></ProtectedRoute>} />
          */}

          {/* 404 */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Layout>
                  <h1 className="p-8 text-2xl text-gray-600">404 — Page Not Found</h1>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
