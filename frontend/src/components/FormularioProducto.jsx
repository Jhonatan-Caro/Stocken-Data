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
}){
    const handleInput = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    return(
        <div className="panel">
            <h3>{modoEditar ? "Modificar" : "Agregar"} Producto</h3>
            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleInput} />
            <input name="precio" placeholder="Precio" value={form.precio} onChange={handleInput} />
            <input name="stock" placeholder="Stock" value={form.stock} onChange={handleInput} />
            <button onClick={enviarProducto}>{modoEditar ? "Guardar" : "Agregar"}</button>
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



