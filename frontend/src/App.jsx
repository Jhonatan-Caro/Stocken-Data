import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./features/auth/pages/LoginPage";
import Register from "./features/auth/pages/SignUpPage";

import Home from "./features/landing/pages/Home";
import Plans from "./features/landing/pages/Plans";
import AboutUs from "./features/landing/pages/AboutUs";
import Support from "./features/landing/pages/Support";

import Dashboard from "./features/dashboard/pages/Dashboard";
import Products from "./features/products/page/Products";
import Settings from "./features/dashboard/pages/Settings";
import Categories from "./features/categories/pages/Categories";
import Sales from "./features/sale/pages/Sales";
import SalesStatistics from "./features/sale/pages/SalesStatistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* <Route path="/home" element={<Home />} /> */}
        {/* <Route path="/plans" element={<Plans />} /> */}
        {/* <Route path="/about" element={<AboutUs />} /> */}
        {/* <Route path="/support" element={<Support />} /> */}

        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/products"
          element={<Products key={location.pathname} />}
        />
        <Route path="/categories" element={<Categories />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sales" element={<Sales />} />
        {/* [NUEVO] estadísticas de ventas */}
        <Route path="/sales/statistics" element={<SalesStatistics />} />
      </Routes>
    </Router>
  );
}
