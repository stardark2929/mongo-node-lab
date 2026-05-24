import { useState, useEffect } from "react";

const API = "http://localhost:3001/api";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/pedidos`)
      .then((r) => r.json())
      .then((data) => {
        setPedidos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        <h1>Pedidos</h1>
      </div>
      {loading ? (
        <p className="empty-text">Cargando...</p>
      ) : pedidos.length === 0 ? (
        <p className="empty-text">No hay pedidos. Carga los datos de prueba desde el Dashboard.</p>
      ) : (
        <div className="pedidos-list">
          {pedidos.map((p) => (
            <div className="pedido-card" key={p._id}>
              <div className="pedido-header">
                <div>
                  <div className="pedido-cliente">{p.cliente}</div>
                  <div className="pedido-fecha">{formatFecha(p.fecha)}</div>
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
