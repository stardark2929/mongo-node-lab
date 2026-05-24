// Cargo las variables de mi archivo .env para usarlas aquí
require("dotenv").config();
// Importo mongoose, que me permite trabajar con esquemas y modelos en MongoDB
const mongoose = require("mongoose");

// Me conecto a MongoDB usando Mongoose y mi URI de las variables de entorno
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conexión exitosa a MongoDB con Mongoose")) // Mensaje si conecta bien
  .catch(error => console.error("Ocurrió un error al conectar con Mongoose:", error)); // Mensaje si falla

// Defino el esquema (schema): Es la estructura que tendrán mis documentos en la base de datos
const ProductoSchema = new mongoose.Schema({
  nombre: String,   // Campo para el nombre (tipo texto)
  precio: Number,   // Campo para el precio (tipo número)
  stock: Number     // Campo para el inventario (tipo número)
});

// Creo el modelo "Producto" basado en el esquema que acabo de definir
// Mongoose creará automáticamente una colección llamada "productos" en mi base de datos
const Producto = mongoose.model("Producto", ProductoSchema);

// Función asíncrona para crear y guardar un nuevo producto de ejemplo
async function crearProducto() {
  // Creo una nueva instancia de mi modelo con los datos del producto
  const producto = new Producto({
    nombre: "Mouse Inalámbrico",
    precio: 25,
    stock: 50
  });

  // El método save() guarda el objeto directamente en mi colección de MongoDB
  await producto.save();
  // Muestro en consola el producto que acabo de guardar para confirmar
  console.log("Nuevo producto guardado exitosamente:", producto);
}

// Ejecuto mi función para guardar el producto de prueba
crearProducto();
