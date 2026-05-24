// Cargo las variables de entorno de mi archivo .env (útil para local)
require("dotenv").config();
// Importo Express para crear mi servidor web y mis rutas API
const express = require("express");
// Importo CORS para que mi servidor acepte peticiones desde el frontend sin bloqueos
const cors = require("cors");
// Importo mi función de conexión a la base de datos de mi archivo local database.js
const { connectDB } = require("./database");
// Importo ObjectId de MongoDB por si necesito buscar documentos por su ID específico
const { ObjectId } = require("mongodb");

// Inicializo mi aplicación Express
const app = express();
// Configuro el PUERTO: Uso process.env.PORT para Render, o 3000 como puerto por defecto local
const PORT = process.env.PORT || 3000;

// Activo el middleware de CORS para permitir conexiones externas
app.use(cors());
// Habilito mi servidor para recibir y entender datos en formato JSON en las peticiones
app.use(express.json());

// Creo una variable global para guardar la referencia a mi base de datos
let db;

// Defino la función principal para arrancar mi servidor de forma ordenada
async function startServer() {
  try {
    // Me conecto a la base de datos y guardo el resultado en mi variable global db
    db = await connectDB();
    // Si no obtengo respuesta de la base de datos, lanzo un error
    if (!db) throw new Error("connectDB retornó undefined — revisa tu MONGO_URI y que MongoDB esté corriendo");
    // Le digo a Express que empiece a escuchar las peticiones en el puerto asignado
    app.listen(PORT, () => {
      // Muestro un mensaje indicando que el servidor está activo y en qué puerto
      console.log(`Servidor corriendo en el puerto: ${PORT}`);
    });
  } catch (err) {
    // Si hay un error fatal al iniciar, lo muestro en consola y cierro el programa
    console.error("No se pudo iniciar el servidor:", err.message);
    process.exit(1);
  }
}

// Llamo a la función para que el servidor empiece a funcionar
startServer();

// --- MIS RUTAS (ENDPOINTS) ---

// GET /api/clientes: Trae todos los clientes registrados
app.get("/api/clientes", async (req, res) => {
  try {
    // Busco en la colección clientes, traigo todo y lo convierto a un array
    const clientes = await db.collection("clientes").find().toArray();
    // Respondo enviando el JSON con la lista de clientes
    res.json(clientes);
  } catch (err) {
    // Si falla, devuelvo un error 500 con el mensaje
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clientes: Registra un nuevo cliente en la base de datos
app.post("/api/clientes", async (req, res) => {
  try {
    // Extraigo los datos del cuerpo de la petición
    const { nombre, correo, ciudad, edad } = req.body;
    // Valido que todos los campos requeridos estén presentes
    if (!nombre || !correo || !ciudad || !edad) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }
    // Verifico si ya existe un cliente con ese mismo correo
    const existente = await db.collection("clientes").findOne({ correo });
    if (existente) {
      return res.status(400).json({ error: "Ya existe un cliente con ese correo" });
    }
    // Preparo el objeto del nuevo cliente, convirtiendo la edad a número
    const nuevoCliente = { nombre, correo, ciudad, edad: parseInt(edad) };
    // Inserto el nuevo cliente en la colección correspondiente
    await db.collection("clientes").insertOne(nuevoCliente);
    // Devuelvo el código 201 de creado y los datos del nuevo cliente
    res.status(201).json({ message: "Cliente registrado con éxito", cliente: nuevoCliente });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productos: Lista todos los productos de mi catálogo
app.get("/api/productos", async (req, res) => {
  try {
    const productos = await db.collection("productos").find().toArray();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pedidos: Lista todos los pedidos realizados
app.get("/api/pedidos", async (req, res) => {
  try {
    const pedidos = await db.collection("pedidos").find().toArray();
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes-frecuentes: Clientes con 2 o más pedidos realizados
app.get("/api/clientes-frecuentes", async (req, res) => {
  try {
    // Uso agregaciones de MongoDB para realizar consultas complejas
    const resultado = await db
      .collection("pedidos")
      .aggregate([
        // Agrupo por cliente y cuento cuántos pedidos tiene
        { $group: { _id: "$cliente", totalPedidos: { $sum: 1 } } },
        // Filtro los que tienen 2 o más pedidos
        { $match: { totalPedidos: { $gte: 2 } } },
        // Busco sus datos personales en la colección clientes (lookup)
        {
          $lookup: {
            from: "clientes",
            localField: "_id",
            foreignField: "nombre",
            as: "datosCliente",
          },
        },
        // Saco el objeto de datos del array que genera el lookup
        { $unwind: "$datosCliente" },
        // Selecciono solo los campos que me interesa mostrar
        {
          $project: {
            nombre: "$datosCliente.nombre",
            correo: "$datosCliente.correo",
            ciudad: "$datosCliente.ciudad",
            totalPedidos: 1,
          },
        },
      ])
      .toArray();
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stock-critico: Productos con stock menor a 5 unidades
app.get("/api/stock-critico", async (req, res) => {
  try {
    const productos = await db
      .collection("productos")
      .find({ stock: { $lt: 5 } }) // Uso $lt (less than) para comparar
      .toArray();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pedidos-ciudad/:ciudad: Filtra pedidos por la ciudad del cliente
app.get("/api/pedidos-ciudad/:ciudad", async (req, res) => {
  try {
    const { ciudad } = req.params; // Obtengo la ciudad de la URL
    const resultado = await db
      .collection("pedidos")
      .aggregate([
        // Cruzo pedidos con clientes para saber la ciudad
        {
          $lookup: {
            from: "clientes",
            localField: "cliente",
            foreignField: "nombre",
            as: "datosCliente",
          },
        },
        { $unwind: "$datosCliente" },
        // Filtro los que coinciden con la ciudad solicitada
        { $match: { "datosCliente.ciudad": ciudad } },
      ])
      .toArray();
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ticket-promedio/:nombre: Calcula el gasto promedio de un cliente
app.get("/api/ticket-promedio/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    const resultado = await db
      .collection("pedidos")
      .aggregate([
        // Filtro por el nombre del cliente
        { $match: { cliente: nombre } },
        // Agrupo y calculo el promedio del campo total
        { $group: { _id: "$cliente", ticketPromedio: { $avg: "$total" } } },
      ])
      .toArray();
    if (resultado.length === 0) {
      return res.json({ cliente: nombre, ticketPromedio: 0 });
    }
    res.json({ cliente: nombre, ticketPromedio: resultado[0].ticketPromedio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pedidos: Registra un pedido nuevo y valida el stock automáticamente
app.post("/api/pedidos", async (req, res) => {
  try {
    const { cliente, productos } = req.body;

    if (!cliente || !productos || productos.length === 0) {
      return res.status(400).json({ error: "Cliente y productos son requeridos" });
    }

    // 1. Verifico si hay stock suficiente para cada producto del pedido
    for (const item of productos) {
      const producto = await db
        .collection("productos")
        .findOne({ nombre: item.nombre });

      if (!producto) {
        return res.status(404).json({ error: `Producto "${item.nombre}" no encontrado` });
      }
      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para "${item.nombre}". Disponible: ${producto.stock}`,
        });
      }
    }

    // 2. Calculo el monto total sumando el precio real de cada producto por su cantidad
    let total = 0;
    for (const item of productos) {
      const producto = await db
        .collection("productos")
        .findOne({ nombre: item.nombre });
      total += producto.precio * item.cantidad;
    }

    // 3. Preparo e inserto el nuevo pedido con la fecha actual
    const nuevoPedido = {
      cliente,
      productos,
      total,
      fecha: new Date(),
    };
    await db.collection("pedidos").insertOne(nuevoPedido);

    // 4. Descuento las cantidades vendidas del stock de los productos
    for (const item of productos) {
      await db
        .collection("productos")
        .updateOne({ nombre: item.nombre }, { $inc: { stock: -item.cantidad } });
    }

    res.status(201).json({ message: "Pedido registrado con éxito", pedido: nuevoPedido });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/seed: Borra todo y llena la base con datos de prueba
app.post("/api/seed", async (req, res) => {
  try {
    // Limpio mis colecciones antes de sembrar los datos nuevos
    await db.collection("clientes").deleteMany({});
    await db.collection("productos").deleteMany({});
    await db.collection("pedidos").deleteMany({});

    // Datos falsos de ejemplo
    const clientes = [
      { nombre: "Ana García", correo: "ana@example.com", ciudad: "Lima", edad: 29 },
      { nombre: "Luis Pérez", correo: "luis@example.com", ciudad: "Arequipa", edad: 35 },
      { nombre: "María Torres", correo: "maria@example.com", ciudad: "Lima", edad: 24 },
      { nombre: "Carlos Ríos", correo: "carlos@example.com", ciudad: "Cusco", edad: 42 },
      { nombre: "Sofía Mendoza", correo: "sofia@example.com", ciudad: "Arequipa", edad: 31 },
    ];

    const productos = [
      { nombre: "Laptop", precio: 1200, stock: 8 },
      { nombre: "Mouse", precio: 50, stock: 3 },
      { nombre: "Teclado", precio: 80, stock: 15 },
      { nombre: "Monitor", precio: 350, stock: 2 },
      { nombre: "Audífonos", precio: 120, stock: 4 },
    ];

    const pedidos = [
      {
        cliente: "Ana García",
        productos: [
          { nombre: "Laptop", cantidad: 1 },
          { nombre: "Mouse", cantidad: 1 },
        ],
        total: 1250,
        fecha: new Date("2024-01-15"),
      },
      {
        cliente: "Ana García",
        productos: [{ nombre: "Teclado", cantidad: 2 }],
        total: 160,
        fecha: new Date("2024-02-20"),
      },
      {
        cliente: "Luis Pérez",
        productos: [{ nombre: "Monitor", cantidad: 1 }],
        total: 350,
        fecha: new Date("2024-03-10"),
      },
    ];

    // Inserto los datos masivamente en MongoDB
    await db.collection("clientes").insertMany(clientes);
    await db.collection("productos").insertMany(productos);
    await db.collection("pedidos").insertMany(pedidos);

    res.json({ message: "Datos de prueba cargados correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
