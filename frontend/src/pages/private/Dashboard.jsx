import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProductos from "../../hooks/useProductos";
//import { cargarProductos } from "../hooks/useProductos";
import FormularioProducto from "../../components/FormularioProducto";  
import TablaProductos from "../../components/TablaProductos";
import PaginaCargaCSV from "../private/PaginaCargaCSV";
import ChatBotWrapper from "../../componentsV/ChatBotWrapper";
import Header from "../../componentsV/Header";

export default function Dashboard(){

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [data, setData] = useState(null);
  const {
    form,
    setForm,
    caracteristicas,
    setCaracteristicas,
    modoEditar,
    enviarProducto,
    eliminarProducto,
    prepararEdicion,
    claveFiltro,
    setClaveFiltro,
    filtro,
    setFiltro,
    productosFiltrados,
    cargarProductos,
    setProductos,
    resetFormulario,
  } = useProductos();
    
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/Login");
      return;
    }
    const fetchData = async () => {
      try { 
        const res = await fetch("http://localhost:4000/api/dashboard", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("No autorizado");
        }
      
        const result = await res.json();
        setData(result);

        const productos = await cargarProductos();
        setProductos(productos);

      } catch (error) {
          console.error("Error fetching data:", error);
          navigate("/Login");
        }
    };
    fetchData();   

  }, [navigate]);	


  return(
    <div className="min-h-screen bg-gray-100 pb-5">
      {/* Cabecera de Navegación */}
      <div className="fixed top-0 left-0 w-full z-50"><Header /></div>
      
      {/* Contenedor Principal */}
      <div className="pt-32 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Sección Izquierda */}
          <div className="bg-white rounded-xl shadow p-6">
            {/* Tabla Productos */}
            <h2 className="text-xl text-custom-verde font-bold mb-4"> Tabla de Productos </h2>
            <TablaProductos
              productos={productosFiltrados}
              prepararEdicion={prepararEdicion}
              eliminarProducto={eliminarProducto}
            />
          </div>
          
          {/* Sección Derecha */}
          <div className="bg-white rounded-xl shadow p-6">
            
            {/* Formulario Agregar Producto */}
            <h2 className="text-lg text-custom-verde font-semibold mb-2"> Agregar Producto </h2>
            <FormularioProducto
              form={form}
              setForm={setForm}
              caracteristicas={caracteristicas}
              setCaracteristicas={setCaracteristicas}
              modoEditar={modoEditar}
              enviarProducto={enviarProducto}
              claveFiltro={claveFiltro}
              setClaveFiltro={setClaveFiltro}
              filtro={filtro}
              setFiltro={setFiltro}
              resetFormulario={resetFormulario}
            />
          </div>
        </div>
      </div>

      {/* Botón estático para abrir el ChatBot */}
      <div><ChatBotWrapper /></div>
    </div>
  );
}