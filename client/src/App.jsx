import { useState, useEffect } from "react";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Pedidos from "./pages/Pedidos";
import NuevoPedido from "./pages/NuevoPedido";
import PedidosCiudad from "./pages/PedidosCiudad";
import NuevoCliente from "./pages/NuevoCliente";
import "./App.css";

const API = "http://localhost:3001/api";

function Dashboard() {
  const [frecuentes, setFrecuentes] = useState([]);
  const [stockCritico, setStockCritico] = useState([]);
  const [ticketAna, setTicketAna] = useState(null);
  const [seedMsg, setSeedMsg] = useState("");
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/clientes-frecuentes`)
      .then((r) => r.json())
      .then(setFrecuentes)
      .catch(() => {});
    fetch(`${API}/stock-critico`)
      .then((r) => r.json())
      .then(setStockCritico)
      .catch(() => {});
    fetch(`${API}/ticket-promedio/Ana García`)
      .then((r) => r.json())
      .then((d) => setTicketAna(d.ticketPromedio))
      .catch(() => {});
  }, []);

  async function cargarSeed() {
    setSeedLoading(true);
    setSeedMsg("");
    try {
      const res = await fetch(`${API}/seed`, { method: "POST" });
      const data = await res.json();
      setSeedMsg(data.message || "Datos cargados");
      // Recargar datos
      const [f, s, t] = await Promise.all([
        fetch(`${API}/clientes-frecuentes`).then((r) => r.json()),
        fetch(`${API}/stock-critico`).then((r) => r.json()),
        fetch(`${API}/ticket-promedio/Ana García`).then((r) => r.json()),
      ]);
      setFrecuentes(f);
      setStockCritico(s);
      setTicketAna(t.ticketPromedio);
    } catch {
      setSeedMsg("Error al cargar datos");
    } finally {
      setSeedLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <button
          className="btn-seed"
          onClick={cargarSeed}
          disabled={seedLoading}
        >
          {seedLoading ? "Cargando..." : "Cargar datos de prueba"}
        </button>
      </div>
      {seedMsg && <div className="alert-success">{seedMsg}</div>}

      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Clientes Frecuentes</h2>
          <div className="cards-list">
            {frecuentes.length === 0 ? (
              <p className="empty-text">Sin datos. Carga los datos de prueba.</p>
            ) : (
              frecuentes.map((c, i) => (
                <div className="info-card" key={i}>
                  <div className="info-card-name">{c.nombre}</div>
                  <div className="info-card-sub">{c.correo}</div>
                  <div className="info-card-sub">{c.ciudad}</div>
                  <span className="badge-purple">{c.totalPedidos} pedidos</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Stock Crítico</h2>
          <div className="cards-list">
            {stockCritico.length === 0 ? (
              <p className="empty-text">Sin productos con stock crítico.</p>
            ) : (
              stockCritico.map((p, i) => (
                <div className="info-card" key={i}>
                  <div className="info-card-name">{p.nombre}</div>
                  <div className="info-card-sub">${p.precio}</div>
                  <span className="badge-red">Stock: {p.stock}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Ticket Promedio — Ana García</h2>
          <div className="ticket-display">
            {ticketAna !== null ? (
              <span className="ticket-value">${ticketAna.toFixed(2)}</span>
            ) : (
              <p className="empty-text">Sin datos disponibles.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "clientes", label: "Clientes" },
    { id: "nuevo-cliente", label: "Nuevo Cliente" },
    { id: "productos", label: "Productos" },
    { id: "pedidos", label: "Pedidos" },
    { id: "nuevo-pedido", label: "Nuevo Pedido" },
    { id: "pedidos-ciudad", label: "Pedidos por Ciudad" },
  ];

  function renderPage() {
    switch (page) {
      case "clientes":
        return <Clientes />;
      case "productos":
        return <Productos />;
      case "pedidos":
        return <Pedidos />;
      case "nuevo-pedido":
        return <NuevoPedido />;
      case "pedidos-ciudad":
        return <PedidosCiudad />;
      case "nuevo-cliente":
        return <NuevoCliente />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🛒</span>
          <span>TiendaOnline</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}
