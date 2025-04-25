import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function Home(){
  return (
    <div className="text-center mt-10 text-2x1">
      Binevenido a Stocken Data. <br />
      Ve a <a className="text-blue-500 underline" href="/Register">/Register</a>Para crear una cuenta
    </div>
  );
}

function App() {
  //const [count, setCount] = useState(0)
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App