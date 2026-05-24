// Importo mi función para conectarme a la base de datos desde mi archivo database.js
const { connectDB } = require("./database");

// ===== OPERACIONES CRUD DE PRUEBA =====

// Función para insertar un producto de prueba en la colección "productos"
async function insertProducto() {
  // Establezco conexión con la base de datos MongoDB
  const db = await connectDB();

  // Obtengo la referencia a la colección "productos" (se crea sola si no existe)
  const productos = db.collection("productos");

  // Defino el objeto que representa a mi nuevo producto
  const nuevoProducto = { nombre: "Laptop", precio: 1200, stock: 10 };

  // Ejecuto la inserción del documento y espero el resultado
  const resultado = await productos.insertOne(nuevoProducto);

  // Muestro en consola el ID que MongoDB le asignó automáticamente al producto
  console.log("Producto insertado con ID:", resultado.insertedId);
}

// Función para leer y listar todos los documentos de la colección "productos"
async function leerProductos() {
  const db = await connectDB();
  const productos = db.collection("productos");

  // Uso find() para buscar todo y toArray() para convertir el cursor en una lista legible
  const lista = await productos.find().toArray();

  // Muestro la lista de productos encontrada en la terminal
  console.log("Lista de productos actual:", lista);
}

// Función para actualizar el precio de un producto específico
async function actualizarProducto() {
  const db = await connectDB();
  const productos = db.collection("productos");

  // updateOne busca por filtro (nombre) y aplica cambios con el operador $set
  const resultado = await productos.updateOne(
    { nombre: "Laptop" },        // Mi filtro para encontrar el producto
    { $set: { precio: 1100 } }   // El cambio que quiero realizar
  );

  // Muestro cuántos documentos fueron afectados por la actualización
  console.log("Documentos actualizados correctamente:", resultado.modifiedCount);
}

// Función para eliminar un producto de la colección
async function eliminarProducto() {
  const db = await connectDB();
  const productos = db.collection("productos");

  // deleteOne elimina el primer documento que coincida exactamente con el filtro
  const resultado = await productos.deleteOne({ nombre: "Laptop" });

  // Confirmo en consola si el producto fue eliminado (debería ser 1)
  console.log("Cantidad de productos eliminados:", resultado.deletedCount);
}

// ===== FLUJO DE EJECUCIÓN PRINCIPAL =====
// Agrupo todas las funciones en orden para ver el CRUD funcionando en mi terminal
async function main() {
  console.log("--- Iniciando pruebas de CRUD ---");
  await insertProducto();         // Paso 1: Crear
  await leerProductos();          // Paso 2: Leer
  await actualizarProducto();     // Paso 3: Actualizar
  await leerProductos();          // Paso 4: Leer de nuevo para verificar cambio
  await eliminarProducto();       // Paso 5: Borrar
  await leerProductos();          // Paso 6: Confirmar que ya no hay nada
  console.log("--- Pruebas terminadas con éxito ---");
  
  // Como esto es un script de terminal, cierro el proceso de Node al finalizar
  process.exit(0);
}

// Ejecuto mi secuencia de pruebas
main();
