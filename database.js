require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

// Desactivo la verificación estricta de TLS para compatibilidad con Render y Node.js 24
const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  serverSelectionTimeoutMS: 5000
});

async function connectDB() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");
    return client.db("mongo-node-lab");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
}

module.exports = { connectDB, client };