// Cargo las variables de mi archivo .env para proteger mi URI y credenciales
require("dotenv").config();

// Importo la clase MongoClient del driver oficial de MongoDB para conectarme
const { MongoClient } = require("mongodb");

// Obtengo la URI de conexión desde mis variables de entorno
const uri = process.env.MONGO_URI;

// Agrego tlsAllowInvalidCertificates para resolver el conflicto de SSL con Node.js 24
const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true
});

// Defino mi función asíncrona para conectarme a la base de datos de forma limpia
async function connectDB() {
  try {
    // Intento conectarme al servidor de MongoDB esperando que termine la tarea
    await client.connect();
    // Si sale bien, mando un mensaje a la consola confirmando el éxito
    console.log("Conectado a MongoDB");
    // Retorno el objeto de la base de datos para usarlo en mis otras rutas o archivos
    return client.db();
  } catch (error) {
    // Si algo falla, capturo el error y lo muestro para saber qué pasó
    console.error("Error al conectar a MongoDB:", error);
  }
}

// Exporto mi función de conexión y el cliente para que otros archivos puedan usarlos
module.exports = { connectDB, client };
