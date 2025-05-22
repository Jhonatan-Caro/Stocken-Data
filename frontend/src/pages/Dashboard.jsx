import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProductos from "../hooks/useProductos";
//import { cargarProductos } from "../hooks/useProductos";
import FormularioProducto from "../components/FormularioProducto";  
import TablaProductos from "../components/TablaProductos";
import PaginaCargaCSV from "../pages/PaginaCargaCSV";

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
    <div className="contenedor">
      <TablaProductos
        productos={productosFiltrados}
        prepararEdicion={prepararEdicion}
        eliminarProducto={eliminarProducto}
      />
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
      <button onClick={() => navigate("/cargar-datos")}>Subir archivo CSV</button>
    </div>
  );
}