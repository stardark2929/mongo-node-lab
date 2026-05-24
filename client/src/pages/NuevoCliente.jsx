import { useState } from "react";

const API = "http://localhost:3001/api";

export default function NuevoCliente() {
  const [form, setForm] = useState({ nombre: "", correo: "", ciudad: "", edad: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const { nombre, correo, ciudad, edad } = form;
    if (!nombre || !correo || !ciudad || !edad) {
      setMsg({ type: "error", text: "Todos los campos son obligatorios." });
      return;
    }
    if (isNaN(parseInt(edad)) || parseInt(edad) < 1) {
      setMsg({ type: "error", text: "La edad debe ser un número válido." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, ciudad, edad: parseInt(edad) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "Error al registrar cliente." });
      } else {
        setMsg({ type: "success", text: `Cliente "${nombre}" registrado con éxito.` });
        setForm({ nombre: "", correo: "", ciudad: "", edad: "" });
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: `No se pudo conectar al servidor en http://localhost:3001. ¿Está corriendo "node server.js"? (${err.message})`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Nuevo Cliente</h1>
      </div>

      {msg && (
        <div className={msg.type === "success" ? "alert-success" : "alert-error"}>
          {msg.text}
        </div>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input
            className="form-input"
            type="text"
            name="nombre"
            placeholder="Ej: Ana García"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Correo electrónico</label>
          <input
            className="form-input"
            type="email"
            name="correo"
            placeholder="Ej: ana@example.com"
            value={form.correo}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Ciudad</label>
          <input
            className="form-input"
            type="text"
            name="ciudad"
            placeholder="Ej: Lima"
            value={form.ciudad}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Edad</label>
          <input
            className="form-input"
            type="number"
            name="edad"
            placeholder="Ej: 28"
            min="1"
            max="120"
            value={form.edad}
            onChange={handleChange}
          />
        </div>

        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Registrar Cliente"}
        </button>
      </form>
    </div>
  );
}
