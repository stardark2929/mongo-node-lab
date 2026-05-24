import { useState, useEffect } from "react";

const API = "http://localhost:3001/api";

export default function NuevoPedido() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [seleccion, setSeleccion] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/clientes`)
      .then((r) => r.json())
      .then(setClientes)
      .catch(() => {});
    fetch(`${API}/productos`)
      .then((r) => r.json())
      .then(setProductos)
      .catch(() => {});
  }, []);

  function toggleProducto(nombre) {
    setSeleccion((prev) => {
      if (prev[nombre]) {
        const next = { ...prev };
        delete next[nombre];
        return next;
      }
      return { ...prev, [nombre]: 1 };
    });
  }

  function setCantidad(nombre, cantidad) {
    const val = Math.max(1, parseInt(cantidad) || 1);
    setSeleccion((prev) => ({ ...prev, [nombre]: val }));
  }

  async function registrarPedido(e) {
    e.preventDefault();
    setMsg(null);

    if (!clienteSeleccionado) {
      setMsg({ type: "error", text: "Selecciona un cliente." });
      return;
    }

    const productosSeleccionados = Object.entries(seleccion).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }));

    if (productosSeleccionados.length === 0) {
      setMsg({ type: "error", text: "Selecciona al menos un producto." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: clienteSeleccionado,
          productos: productosSeleccionados,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "Error al registrar pedido." });
      } else {
        setMsg({ type: "success", text: data.message });
        setClienteSeleccionado("");
        setSeleccion({});
        // Refrescar lista de productos para ver stock actualizado
        fetch(`${API}/productos`)
          .then((r) => r.json())
          .then(setProductos)
          .catch(() => {});
      }
    } catch {
      setMsg({ type: "error", text: "Error de conexión con el servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Nuevo Pedido</h1>
      </div>

      {msg && (
        <div className={msg.type === "success" ? "alert-success" : "alert-error"}>
          {msg.text}
        </div>
      )}

      <form className="form-card" onSubmit={registrarPedido}>
        <div className="form-group">
          <label className="form-label">Cliente</label>
          <select
            className="form-select"
            value={clienteSeleccionado}
            onChange={(e) => setClienteSeleccionado(e.target.value)}
          >
            <option value="">— Selecciona un cliente —</option>
            {clientes.map((c) => (
              <option key={c._id} value={c.nombre}>
                {c.nombre} ({c.ciudad})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Productos</label>
          {productos.length === 0 ? (
            <p className="empty-text">Carga los datos de prueba desde el Dashboard.</p>
          ) : (
            <div className="products-list">
              {productos.map((p) => (
                <div className="product-row" key={p._id}>
                  <input
                    type="checkbox"
                    checked={!!seleccion[p.nombre]}
                    onChange={() => toggleProducto(p.nombre)}
                    id={`prod-${p._id}`}
                  />
                  <label className="product-name" htmlFor={`prod-${p._id}`}>
                    {p.nombre}
                  </label>
                  <span className="product-price">
                    ${p.precio} — Stock: {p.stock}
                  </span>
                  {seleccion[p.nombre] !== undefined && (
                    <input
                      type="number"
                      className="qty-input"
                      min="1"
                      max={p.stock}
                      value={seleccion[p.nombre]}
                      onChange={(e) => setCantidad(p.nombre, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar Pedido"}
        </button>
      </form>
    </div>
  );
}
