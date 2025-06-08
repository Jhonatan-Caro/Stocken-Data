import { useState } from "react";

const API_URL = "http://localhost:4000/api/ventas"

export default function useVentas(){
    const [ ventas, setVentas ] = useState([]);
    const [ registroVenta, setRegistroVenta ] = useState([]);
    const [mensaje, setMensaje ] = useState("")
    const [ error, setError ] = useState(null);

    const token = localStorage.getItem("token")

    //Obtener las ventas
    const cargarVentas = async () => {
        try{
            const res = await fetch(API_URL, {
                headers: {                   
                    Authorization: `Bearer ${token}`,
                },               
            })

            if(!res.ok){
                throw new Error("error al obtener las ventas")
            }

            const data = await res.json()
            setVentas(data)
        }catch(err){
            console.error(err)
            setError(err.meessage || "Error al obtener las ventas");        
        }
    }

    //Obtener los registros dinamicos
    const fetchRegistroVenta = async () => {
        try{
            const res = await fetch(`${API_URL}/registros`, {
                headers: {                   
                    Authorization: `Bearer ${token}`,
                },
            })
            if(!res.ok){
                throw new Error("error al obtener registros")
            }

            const data = await res.json()
            console.log(data)
            setRegistroVenta(data)
        }catch(err){
            console.error(err)
            setError(err.meessage || "Error al obtener registros");
        }
    }

    const handleVentaDinamica = async ({ registro_id, cantidad }) => {
        try{
            const res = await fetch(`${API_URL}/dinamicas`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    registro_id,
                    cantidad,
                }),
            })
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Error al realizar la venta dinámica");
            }             
            setMensaje(" ✅ Venta creada con exito");
            cargarVentas();
        }catch(err){
            console.error("Error al realizar la venta:", error);
            setMensaje(" ❌ Error al realizar la venta");          
        }
    }

    const handleVenta = async ({ producto_id, cantidad }) => {
        /*if (!productoSeleccionado || cantidad <= 0) {
            setMensaje("Por favor, selecciona un producto y una cantidad válida.");
            return;
        }*/

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    producto_id: productoSeleccionado,
                    cantidad,
                }),
            });

            if (!response.ok) {
                throw new Error("Error al realizar la venta");
            }

            setMensaje("Venta realizada con éxito");
            cargarVentas();

            //await cargarProductos(); // Recargar productos para actualizar el stock
        } catch (error) {
            console.error("Error al realizar la venta:", error);
            setMensaje("Error al realizar la venta");
        }
    }

    return {
        ventas,
        registroVenta,
        cargarVentas,
        fetchRegistroVenta,
        handleVentaDinamica,
        handleVenta,
        mensaje,
        error,
        setMensaje,
    }

}