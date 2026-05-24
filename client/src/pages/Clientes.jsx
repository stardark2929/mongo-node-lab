import { useState, useEffect } from "react";

const API = "https://mongo-node-lab-0ht8.onrender.com/api";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/clientes`)
      .then((r) => r.json())
      .then((data) => {
        setClientes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Clientes</h1>
      </div>
      {loading ? (
        <p className="empty-text">Cargando...</p>
      ) : clientes.length === 0 ? (
        <p className="empty-text">No hay clientes. Carga los datos de prueba desde el Dashboard.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Ciudad</th>
                <th>Edad</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c._id}>
                  <td>{c.nombre}</td>
                  <td>{c.correo}</td>
                  <td>{c.ciudad}</td>
                  <td>{c.edad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
