import { useState } from "react";

//la definicion de la API esta bien
const api = "http://localhost:4000/productos";
    
//Cargar producto
export default function useProductos(){
    const [productos, setProductos] = useState([]); // Lista de productos
    const [form, setForm] = useState({ nombre: "", precio: "", stock: "" });
    const [caracteristicas, setCaracteristicas] = useState({});
    const [modoEditar, setModoEditar] = useState(false);
    const [productoEditando, setProductoEditando] = useState(null);
    const [filtro, setFiltro] = useState("");
    const [claveFiltro, setClaveFiltro] = useState("");
    const token = localStorage.getItem("token");

    const cargarProductos = async () => {    
        console.log("Token encontrado:", token);
        try {
            const res = await fetch(api, {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${token}`, 
                //"Content-Type": "application/json",
            },
            });
              
            if (!res.ok) {
                const texto = await res.text();
                throw new Error(`Error HTTP ${res.status}: ${texto}`);
            }
            
            const data = await res.json();
            setProductos(data);
            return data
        }catch (err) {
            console.error("Error al cargar productos:", err);
        }
    }; 
    //Enviar productos
    const enviarProducto = async () => {
        // Validación: todos los campos deben estar llenos
        if (
            !String(form.nombre).trim() ||
            !String(form.precio).trim() ||
            !String(form.stock).trim() ||
            Object.keys(caracteristicas).length === 0
        ) {
            alert("Por favor completa todos los campos, incluyendo al menos una característica.");
            return;
        }
        try {
            const producto = {
                ...form,
                precio: parseFloat(form.precio),
                stock: parseInt(form.stock),
                caracteristicas,
            };
          
            const metodo = modoEditar ? "PUT" : "POST";
            const url = modoEditar ? `${api}/${productoEditando.id}` : api;
          
            const res = await fetch(url, {
                method: metodo,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(producto),
            });
          
            await res.json();
            setForm({ nombre: "", precio: "", stock: "" });
            setCaracteristicas({});
            setModoEditar(false);
            setProductoEditando(null);
            await cargarProductos();
        }catch (err) {
                console.error("Error al enviar producto:", err); // 🛠️ CAMBIO: Manejo de error
        }
    };
      
    //Eliminar productos
    const eliminarProducto = async (id) => {
        const confirmacion = confirm("¿Estás seguro de que deseas eliminar este producto?");
        if (!confirmacion) return;
        
        try {
            await fetch(`${api}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}`,  },
            });

            //if (!res.ok) {
                //const msg = await res.text();
                //throw new Error(`Error al eliminar: ${msg}`);
            //}

            await cargarProductos();

        }catch (err) {
                console.error("Error al eliminar producto:", err); // 🛠️ CAMBIO
        }
    };
      
    const prepararEdicion = (producto) => {
        setForm({
            nombre: producto.nombre,
            precio: producto.precio,
            stock: producto.stock,
            caracteristicas: "",
            //caracteristicas: setCaracteristicas(producto.caracteristicas || {}),
        });
        setCaracteristicas(producto.caracteristicas || {});
        setModoEditar(true);
        setProductoEditando(producto);
    };
     
    const resetFormulario = () => {
        setForm({ nombre: "", precio: "", stock: "" });
        setCaracteristicas({});
        setModoEditar(false);
        setProductoEditando(null);
    };

    const productosFiltrados = productos.filter((p) => {
        if (!claveFiltro || !filtro) return true;
      
        const valor = filtro.toLowerCase();
          
        switch (claveFiltro) {
            case "nombre":
                return String(p.nombre).toLowerCase().includes(valor);
            case "precio":
                return String(p.precio).toString().includes(valor);
            case "stock":
                return String(p.stock).toString().includes(valor);
            case "caracteristica":
                  return Object.values(p.caracteristicas || {}).some(v =>
                    String(v).toLowerCase().includes(valor)
                  );
            default:
                return true;
        }
    });

    return{
        form,
        setForm,
        caracteristicas,
        setCaracteristicas,
        setProductos,
        modoEditar,
        enviarProducto,
        eliminarProducto,
        prepararEdicion,
        claveFiltro,
        setClaveFiltro,
        filtro,
        setFiltro,
        productosFiltrados,
        setProductos,
        cargarProductos,
        resetFormulario,
        productos,
        cargarProductos
    }
}