import { useState } from "react";

export default function CaracteristicasForm({ caracteristicas, setCaracteristicas }) {
  const [nuevaClave, setNuevaClave] = useState("");
  const [nuevoValor, setNuevoValor] = useState("");

  const agregarCaracteristica = () => {
    if (nuevaClave.trim() !== "") {
      setCaracteristicas({ ...caracteristicas, [nuevaClave]: nuevoValor });
      setNuevaClave("");
      setNuevoValor("");
    }
  };

  const actualizarValor = (clave, nuevoValor) => {
    setCaracteristicas({ ...caracteristicas, [clave]: nuevoValor });
  };

  const eliminarCaracteristica = (clave) => {
    const actualizado = { ...caracteristicas };
    delete actualizado[clave];
    setCaracteristicas(actualizado);
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h4>Características</h4>
      {Object.entries(caracteristicas).map(([clave, valor]) => (
        <div key={clave} style={{ marginBottom: "0.5rem" }}>
          <input
            value={clave}
            readOnly
            style={{ marginRight: "0.5rem", width: "40%" }}
          />
          <input
            value={valor}
            onChange={(e) => actualizarValor(clave, e.target.value)}
            style={{ width: "40%" }}
          />
          <button onClick={() => eliminarCaracteristica(clave)}>🗑️</button>
        </div>
      ))}

      <input
        placeholder="Nueva clave"
        value={nuevaClave}
        onChange={(e) => setNuevaClave(e.target.value)}
        style={{ marginRight: "0.5rem", width: "40%" }}
      />
      <input
        placeholder="Nuevo valor"
        value={nuevoValor}
        onChange={(e) => setNuevoValor(e.target.value)}
        style={{ width: "40%" }}
      />
      <button onClick={agregarCaracteristica}>➕ Añadir</button>
    </div>
  );
}