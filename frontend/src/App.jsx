import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./features/auth/pages/LoginPage";
import Register from "./features/auth/pages/SignUpPage";

import Inicio from "./features/landing/pages/Inicio";
import Planes from "./features/landing/pages/Planes";
import SobreNosotros from "./features/landing/pages/SobreNosotros";
import Soporte from "./features/landing/pages/Soporte";

import Dashboard from "./features/dashboard/pages/Dashboard";
import Productos from "./features/products/page/Productos";
import Configuracion from "./features/dashboard/pages/Configuracion";
import PaginaCargaCSV from "./features/categorys/pages/PaginaCargaCSV";
import Ventas from "./features/sale/pages/Ventas";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/inicio" element={<Inicio />} />
        <Route path="/planes" element={<Planes />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/soporte" element={<Soporte />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/productos"
          element={<Productos key={location.pathname} />}
        />
        <Route path="/cargar-datos" element={<PaginaCargaCSV />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/ventas" element={<Ventas />} />
      </Routes>
    </Router>
  );
}
