// ---> PENDIENTE DE IMPLEMENTAR <-----

import { useState, useEffect } from "react";

export default function Buscador() {
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
  }, [busqueda]);

  return (
    <input
      type="text"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
