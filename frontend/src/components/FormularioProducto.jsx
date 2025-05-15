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
        setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
        }));
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
        <div className="panel">
            <h3>{modoEditar ? "Modificar" : "Agregar"} Producto</h3>
            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
            <input name="precio" placeholder="Precio" value={form.precio} onChange={handleChange} />
            <input name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} />
                  {/* Formulario para agregar características */}
            <div>
                <h4>Agregar o modificar características</h4>
                {/* Aquí estamos utilizando el formulario para agregar claves/valores */}
                <div>
                <input
                    type="text"
                    placeholder="Clave"
                    value={nuevaClave}
                    onChange={(e) => setNuevaClave(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Valor"
                    value={nuevoValor}
                    onChange={(e) => setNuevoValor(e.target.value)}
                />
                <button type="button" onClick={agregarCaracteristica}>
                    Añadir Característica
                </button>
                </div>
            
                {/* Mostrar las características actuales */}
                <div>
                    {Object.entries(caracteristicas).map(([clave, valor]) => (
                        <div key={clave}>
                        <strong>{clave}</strong>: {valor}
                        </div>
                    ))}
                </div>
                <div>
                    {Object.entries(caracteristicas).map(([clave, valor]) => (
                        <div key={clave}>
                            <input
                                type="text"
                                value={clave}
                                disabled
                                style={{ width: "100px", marginRight: "8px" }}
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
                                style={{ width: "150px" }}
                            />
                        </div>
                    ))}
                </div>
            </div><br></br>

            <button onClick={enviarProducto} disabled={!camposCompletos}>{modoEditar ? "Guardar" : "Agregar"}</button><br></br>
            
            {modoEditar && (
                <button type="button"
                    onClick={resetFormulario}
                >
                Cancelar
                </button>
            )}

            <h3>Aplicar filtros de busqueda</h3>
            <select onChange={(e) => setClaveFiltro(e.target.value)}>
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
            />
        </div>
    )
    }