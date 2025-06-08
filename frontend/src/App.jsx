// Importaciones necesarias
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

// Importación validación
import Login from './pages/validacion/Login'
import Register from './pages/validacion/Register'

//Importación de las páginas públicas	
import Inicio from './pages/public/Inicio'
import Planes from './pages/public/Planes'
import SobreNosotros from './pages/public/SobreNosotros'
import Soporte from './pages/public/Soporte'

// Importación de las páginas de la aplicación/privadas
import Dashboard from './pages/private/Dashboard'
import PaginaCargaCSV from './pages/private/PaginaCargaCSV'
import Ventas from './pages/private/Ventas'


export default function App() {
  return (
    <Router>
      <Routes>
        {/* Redireccionar a la ruta de inicio */}
        <Route path="/" element={<Navigate to="/inicio" replace />} />

        {/* Rutas validación*/}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas públicas*/}
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/planes" element={<Planes />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/soporte" element={<Soporte />} />

        {/* Rutas de la aplicación/privadas*/}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cargar-datos" element={<PaginaCargaCSV />}/>
        <Route path="/ventas" element={<Ventas />} />
      </Routes>
    </Router>
  )
}