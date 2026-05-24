import { useState, useEffect } from "react";

const API = "http://localhost:3001/api";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/productos`)
      .then((r) => r.json())
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Productos</h1>
      </div>
      {loading ? (
        <p className="empty-text">Cargando...</p>
      ) : productos.length === 0 ? (
        <p className="empty-text">No hay productos. Carga los datos de prueba desde el Dashboard.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p._id} className={p.stock < 5 ? "row-critical" : ""}>
                  <td>{p.nombre}</td>
                  <td>${p.precio}</td>
                  <td>{p.stock}</td>
                  <td>
                    {p.stock < 5 ? (
                      <span className="badge-red">Stock crítico</span>
                    ) : (
                      <span className="badge-purple">Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
