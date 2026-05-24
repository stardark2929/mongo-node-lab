import { useState } from "react";

const API = "https://mongo-node-lab-0ht8.onrender.com/api";

export default function PedidosCiudad() {
  const [ciudad, setCiudad] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [buscado, setBuscado] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function buscar(e) {
    e.preventDefault();
    const term = ciudad.trim();
    if (!term) return;
    setLoading(true);
    setError("");
    setPedidos([]);
    try {
      const res = await fetch(`${API}/pedidos-ciudad/${encodeURIComponent(term)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al buscar pedidos");
      } else {
        setPedidos(data);
        setBuscado(term);
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  function formatFecha(fecha) {
    return new Date(fecha).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Pedidos por Ciudad</h1>
      </div>

      <form className="search-form" onSubmit={buscar}>
        <input
          className="search-input"
          type="text"
          placeholder="Ej: Lima, Arequipa, Cusco..."
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
        />
        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && <div className="alert-error">{error}</div>}

      {buscado && !loading && (
        <div style={{ marginBottom: "16px" }}>
          <span className="result-label">
            {pedidos.length === 0
              ? `Sin pedidos para clientes de ${buscado}`
              : `${pedidos.length} pedido${pedidos.length !== 1 ? "s" : ""} encontrado${pedidos.length !== 1 ? "s" : ""} en ${buscado}`}
          </span>
        </div>
      )}

      {pedidos.length > 0 && (
        <div className="pedidos-list">
          {pedidos.map((p) => (
            <div className="pedido-card" key={p._id}>
              <div className="pedido-header">
                <div>
                  <div className="pedido-cliente">{p.cliente}</div>
                  <div className="pedido-fecha">{formatFecha(p.fecha)}</div>
                  {p.datosCliente && (
                    <div className="pedido-fecha">{p.datosCliente.correo}</div>
                  )}
                </div>
                <div className="pedido-total">${p.total}</div>
              </div>
              <div className="pedido-productos">
                {p.productos.map((item, i) => (
                  <span className="pedido-tag" key={i}>
                    {item.nombre} × {item.cantidad}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
