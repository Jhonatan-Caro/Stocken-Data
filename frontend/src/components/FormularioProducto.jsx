import { useEffect, useState } from "react";
import CaracteristicasForm from "./CaracteristicasForm";

export default function FormularioProducto({
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
    resetFormulario
}){
    //Constanto para estados de las caracteristicas y tratar sus valores
    const [nuevaClave, setNuevaClave] = useState("");
    const [nuevoValor, setNuevoValor] = useState("");

    //Constantes para validacion de campos numericos
    const precioValido = !isNaN(form.precio) && Number(form.precio) > 0;
    const stockValido = !isNaN(form.stock) && Number(form.stock) >= 0;

    //Constante para implementar la validacion de campos
    const camposCompletos =
        String(form.nombre).trim() &&
        precioValido &&
        stockValido &&
        Object.keys(caracteristicas).length > 0;

    // Función para manejar el cambio de datos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({...prevForm,[name]: value,}));
    };

    // Función para agregar nuevas características
    const agregarCaracteristica = () => {
        if (nuevaClave.trim() !== "") {
        setCaracteristicas({
            ...caracteristicas,
            [nuevaClave]: nuevoValor,
        });
        setNuevaClave("");  // Limpiar campo de clave
        setNuevoValor("");  // Limpiar campo de valor
        }
    };

    return(
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
            <h3 className="text-xl font-semibold text-custom-azul">
                {modoEditar ? "Modificar" : "Agregar"} Producto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols3 gap-4">
                <input 
                    name="nombre" 
                    placeholder="Nombre" 
                    value={form.nombre} 
                    onChange={handleChange}
                    className="input"
                />
                <input 
                    name="precio" 
                    placeholder="Precio" 
                    value={form.precio} 
                    onChange={handleChange} 
                    className="input"
                />
                <input 
                    name="stock" 
                    placeholder="Stock" 
                    value={form.stock} 
                    onChange={handleChange} 
                    className="input"
                />
            </div>
            
            {/* Formulario para agregar características */}
            <div>
                <h4 className="font-medium text-gray-700 mb-2">Agregar o modificar características</h4>
                {/* Aquí estamos utilizando el formulario para agregar claves/valores */}
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Clave"
                        value={nuevaClave}
                        onChange={(e) => setNuevaClave(e.target.value)}
                        className="input"
                    />
                    <input
                        type="text"
                        placeholder="Valor"
                        value={nuevoValor}
                        onChange={(e) => setNuevoValor(e.target.value)}
                        className="input"
                    />
                    <button 
                        type="button" 
                        onClick={agregarCaracteristica}
                        className="btn bg-custom-verde bg-500 hover:bg-custom-azul bg-600 text-white rounded-xl"
                    >
                        Añadir Característica
                    </button>
                </div>
            
                {/* Mostrar las características actuales */}
                {/*
                <div className="space-y-2">
                    {Object.entries(caracteristicas).map(([clave, valor]) => (
                        <div key={clave} className={"flex gap-2"}>
                        <strong>{clave}</strong>: {valor}
                        </div>
                    ))}
                </div>
                */}
                <div className="space-y-1">
                    {Object.entries(caracteristicas).map(([clave, valor]) => (
                        <div key={clave} className={"flex gap-2"}>
                            <input
                                type="text"
                                value={clave}
                                disabled
                                className="input w-32 bg-gray-100"
                            />
                            <input
                                type="text"
                                value={valor}
                                onChange={(e) =>
                                    setCaracteristicas({
                                    ...caracteristicas,
                                    [clave]: e.target.value,
                                    })
                                }
                                className="input flex-1"
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* Botones */}
            <div className="flex flex-wrap gap-3">
                <button 
                    onClick={enviarProducto}
                    disabled={!camposCompletos}
                    className={`btn ${
                        modoEditar ? "bg-custom-verde rounded-lg p-1 bg-500 hover:bg-custom-azul bg-600" : "bg-500 bg-custom-verde hover:bg-custom-azul bg-600"
                    } text-white rounded-lg p-1`}
                >
                    {modoEditar? "Guardar" : "Agregar"}
                </button>
                {modoEditar && (
                    <button 
                        type="button"
                        onClick={resetFormulario}
                        className="btn rounded-lg p-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
                    >
                    Cancelar
                    </button>
                )}
            </div>

            {/* Filtro de Busqueda */}
            <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold text-custom-azul my-2">Aplicar filtros de busqueda</h3>
                <div className="flex flex-col md:flex-row gap-4 mt-2">
                    <select 
                        onChange={(e) => setClaveFiltro(e.target.value)}
                        className="input"
                    >
                        <option value="">Seleccionar campo</option>
                        <option value="nombre">Nombre</option>
                        <option value="precio">Precio</option>
                        <option value="stock">Stock</option>
                        <option value="caracteristica">Característica personalizada</option>
                    </select>
                    <input
                        placeholder="Valor a filtrar (ej: rojo o 100)"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="input"
                    />
                </div>
            </div>
        </div>
    )
}