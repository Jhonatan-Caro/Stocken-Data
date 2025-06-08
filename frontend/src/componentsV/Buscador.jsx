// Buscador.jsx

// ---> PENDIENTE DE IMPLEMENTAR <-----

import { useState, useEffect } from "react";

export default function Buscador() {
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (!busqueda) return;

    const textoBuscado = busqueda.toLowerCase();
    const body = document.body;

    const buscarTextoEnNodos = (nodo) => {
      if (nodo.nodeType === 3) {
        const texto = nodo.nodeValue;
        if (texto.toLowerCase().includes(textoBuscado)) {
          const span = document.createElement("span");
          span.style.backgroundColor = "yellow";
          span.textContent = texto;
          nodo.parentNode.replaceChild(span, nodo);
        }
      } else {
        nodo.childNodes.forEach(buscarTextoEnNodos);
      }
    };

    // Limpiar resultados anteriores
    document.querySelectorAll("span[style*='background-color']").forEach((el) => {
      const texto = el.textContent;
      el.replaceWith(document.createTextNode(texto));
    });

    buscarTextoEnNodos(body);
  }, [busqueda]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar en la página..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="border px-3 py-1 rounded-full text-sm outline-none"
      />
    </div>
  );
}