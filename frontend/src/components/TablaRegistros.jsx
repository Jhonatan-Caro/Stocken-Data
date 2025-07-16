import { useState } from "react";
import { useCategorias } from "../hooks/useCategorias";
import { useRegistros } from "../hooks/useRegistros";

export default function TablaRegistros() {
  const { categorias } = useCategorias();
  const { registros, removeRegistros, fetchRegistros } = useRegistros();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem("token");
  const [ mostrarFormulario, setMostrarFormulario ] = useState(false);
  const [ nuevoRegistro, setNuevoRegistro ] = useState({});

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditData({ ...registros[index].datos });
  };

  const handleChange = (key, value) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategoriaChange = async (e) => {
    const categoriaId = e.target.value;
    setCategoriaSeleccionada(categoriaId);

    if (categoriaId) {
      const data = await fetchRegistros(categoriaId);

      if (Array.isArray(data) && data.length > 0) {
        const estructuraDatos = Object.keys(data[0].datos).reduce((acc, key) => {
          acc[key] = "";
          return acc;
        }, {});
        setNuevoRegistro(estructuraDatos);
      } else {
        setNuevoRegistro({});
      }
    } else {
      setNuevoRegistro({});
    }
  };  

  const handleSave = async (registroId) => {
    try {
      await fetch(`http://localhost:4000/api/registros/${registroId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ datos: editData }),
      });

      registros[editIndex].datos = editData;
      setEditIndex(null);
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  const handleDelete = async (registroId) => {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (!confirmacion) return;

    try {
      await fetch(`http://localhost:4000/api/registros/${registroId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      removeRegistros(registroId);
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!categoriaSeleccionada) {
      alert("Debe seleccionar una categoría");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/registros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoriaId: categoriaSeleccionada,
          datos: [nuevoRegistro],
        }),
      });

      if (!response.ok) {
        throw new Error("Error al agregar el registro");
      }

      //setNuevoRegistro({});

      await fetchRegistros(categoriaSeleccionada);
      //setMostrarFormulario(false);
      setNuevoRegistro(prev =>
        Object.fromEntries(Object.keys(prev).map(key => [key, ""]))
      );
    } catch (err) {
      console.error("Error al agregar registro:", err);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-custom-azul">
        Registros por Categoría
      </h2>
      
      <select 
        value={categoriaSeleccionada} 
        onChange={handleCategoriaChange}
        className="border border-gray-300 rounded-md px-3 py-2 w-full"
      >
        <option value="">Seleccione una categoría</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nombre}
          </option>
        ))}
      </select>
      
      {mostrarFormulario ? (
        <div className="space-x-2">
          <button
            onClick={() => setMostrarFormulario(false)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-custom-verde text-white px-4 py-2 rounded hover:bg-custom-azul transition"
        >
          Agregar Registro
        </button>
      )}
      <br></br>
      <span className="text-xs text-gray-500 mt-1">
          • Debe haber minimo 1 registro para agregar más registros a la categoría.
      </span>

      {mostrarFormulario && Object.keys(nuevoRegistro).length > 0 && (
        <form onSubmit={handleAgregar} className="space-y-4 mt-4">
            {Object.keys(nuevoRegistro).map((key, index) => (
              <div key={index}>
                  <label className="block text-sm font-medium text-gray-700">{key}</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={nuevoRegistro[key] || ""}
                    onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, [key]: e.target.value })}
                  />
              </div>
            ))}
            <button
              type="submit"
              className="bg-custom-verde bg-600 text-white px-4 py-2 rounded hover:bg-custom-azul bg-700 transition"
            >
              Guardar
            </button>
        </form>
      )}
    
      {registros.length > 0 ? (
        <div className="overflow-auto">
          <table className="w-full mt-6 table-auto border border-gray-200 shadow-sm rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(registros[0].datos).map((key) => (
                  <th key={key} className="px-4 py-2 border-b text-left text-sm font-semibold">{key}</th>
                ))}
                <th className="px-4 py-2 border-b">Fecha</th>
                <th className="px-4 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro, index) => (
                <tr key={registro.id} className="hover:bg-gray-50">
                  {editIndex === index ? (
                    Object.entries(editData).map(([key, value]) => (
                      <td key={key} className="px-4 py-2 border-t">
                       <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-2 py-1"
                          value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                       />
                      </td>
                    ))
                  ) : (
                    Object.values(registro.datos).map((value, i) => (
                      <td key={i} className="px-4 py-2 border-t">{value}</td>
                    ))
                  )}
                  <td className="px-4 py-2 border-t">
                    {new Date(registro.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border-t space-x-2">
                    {editIndex === index ? (
                      <>
                        <button 
                          onClick={() => handleSave(registro.id)}
                          className="bg-custom-verde bg-500 text-white m-2 px-3 p-1 rounded hover:bg-custom-azul bg-600"
                        >
                          Guardar
                        </button>
                        <button 
                          onClick={() => setEditIndex(null)}
                          className="bg-red-300 text-white px-3 py-1 rounded hover:bg-red-400"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEdit(index)}
                          className="bg-custom-verde bg-500 text-white m-2 px-4 p-1 rounded hover:bg-custom-azul bg-600"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(registro.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 mt-4">No hay registros para esta categoría.</p>
      )}
    </div>
  );
}