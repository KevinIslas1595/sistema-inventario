/* =========================================================================
   datos.js
   Aqui vive TODA la informacion del sistema.
   Por ahora se guarda en el navegador (localStorage) para que el sistema
   funcione sin instalar nada. Cuando conectes Supabase, solo hay que
   cambiar las funciones de este archivo: el resto de la pagina no se toca.
   ========================================================================= */

/* --- Usuarios de prueba -------------------------------------------------- */
const USUARIOS = [
  { correo: "admin@demo.com",    clave: "demo123", nombre: "Kevin (Admin)", rol: "admin" },
  { correo: "empleado@demo.com", clave: "demo123", nombre: "Ana (Caja)",    rol: "empleado" }
];

/* --- Productos con los que arranca el sistema la primera vez ------------- */
const PRODUCTOS_INICIALES = [
  { id: 1, nombre: "Coca-Cola 600ml", categoria: "Bebidas",   precio: 20, stock: 48, minimo: 12 },
  { id: 2, nombre: "Sabritas grande", categoria: "Botanas",   precio: 35, stock: 20, minimo: 10 },
  { id: 3, nombre: "Pan Bimbo chico",  categoria: "Abarrotes", precio: 42, stock:  6, minimo: 10 },
  { id: 4, nombre: "Leche Lala 1L",    categoria: "Lacteos",   precio: 28, stock: 30, minimo: 15 },
  { id: 5, nombre: "Huevo (kilo)",     categoria: "Abarrotes", precio: 58, stock:  4, minimo:  8 },
  { id: 6, nombre: "Jabon Zote",       categoria: "Limpieza",  precio: 22, stock: 25, minimo: 10 }
];

/* --- Utilidades internas ------------------------------------------------- */

function leer(llave, porDefecto) {
  const guardado = localStorage.getItem(llave);
  return guardado ? JSON.parse(guardado) : porDefecto;
}

function escribir(llave, valor) {
  localStorage.setItem(llave, JSON.stringify(valor));
}

/* La primera vez que se abre el sistema, se cargan los productos de ejemplo */
function prepararDatos() {
  if (localStorage.getItem("productos") === null) {
    escribir("productos", PRODUCTOS_INICIALES);
  }
  if (localStorage.getItem("ventas") === null) {
    escribir("ventas", []);
  }
}
prepararDatos();

/* =========================================================================
   SESION
   ========================================================================= */

function iniciarSesion(correo, clave) {
  const usuario = USUARIOS.find(
    u => u.correo === correo.trim().toLowerCase() && u.clave === clave
  );
  if (!usuario) return null;

  // No guardamos la contrasena en la sesion
  const sesion = { correo: usuario.correo, nombre: usuario.nombre, rol: usuario.rol };
  escribir("sesion", sesion);
  return sesion;
}

function sesionActual() {
  return leer("sesion", null);
}

function cerrarSesion() {
  localStorage.removeItem("sesion");
  window.location.href = "index.html";
}

/* Se llama al inicio de cada pagina privada: si no hay sesion, te saca */
function exigirSesion() {
  const sesion = sesionActual();
  if (!sesion) {
    window.location.href = "index.html";
    return null;
  }
  return sesion;
}

/* =========================================================================
   PRODUCTOS
   ========================================================================= */

function listarProductos() {
  return leer("productos", []);
}

function buscarProducto(id) {
  return listarProductos().find(p => p.id === Number(id)) || null;
}

/* Si el producto trae id, lo actualiza. Si no, lo crea. */
function guardarProducto(producto) {
  const productos = listarProductos();

  if (producto.id) {
    const posicion = productos.findIndex(p => p.id === Number(producto.id));
    productos[posicion] = { ...productos[posicion], ...producto, id: Number(producto.id) };
  } else {
    const nuevoId = productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    productos.push({ ...producto, id: nuevoId });
  }

  escribir("productos", productos);
}

function borrarProducto(id) {
  escribir("productos", listarProductos().filter(p => p.id !== Number(id)));
}

/* Productos a los que ya les queda poco */
function productosBajos() {
  return listarProductos().filter(p => p.stock <= p.minimo);
}

/* =========================================================================
   VENTAS
   ========================================================================= */

function registrarVenta(idProducto, cantidad) {
  const producto = buscarProducto(idProducto);
  cantidad = Number(cantidad);

  if (!producto)                return { ok: false, mensaje: "El producto no existe." };
  if (cantidad <= 0)            return { ok: false, mensaje: "La cantidad debe ser mayor a cero." };
  if (cantidad > producto.stock) return { ok: false, mensaje: `Solo quedan ${producto.stock} piezas.` };

  // Baja el stock
  guardarProducto({ id: producto.id, stock: producto.stock - cantidad });

  // Guarda la venta
  const ventas = leer("ventas", []);
  ventas.push({
    id: ventas.length ? Math.max(...ventas.map(v => v.id)) + 1 : 1,
    idProducto: producto.id,
    producto: producto.nombre,
    cantidad: cantidad,
    total: producto.precio * cantidad,
    fecha: new Date().toISOString(),
    vendedor: sesionActual() ? sesionActual().nombre : "—"
  });
  escribir("ventas", ventas);

  return { ok: true, mensaje: `Venta registrada: ${cantidad} x ${producto.nombre}` };
}

function listarVentas() {
  return leer("ventas", []);
}

/* =========================================================================
   AYUDAS PARA MOSTRAR
   ========================================================================= */

function dinero(cantidad) {
  return "$" + Number(cantidad).toFixed(2);
}

function fechaCorta(iso) {
  const f = new Date(iso);
  return f.toLocaleDateString("es-MX") + " " +
         f.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function esHoy(iso) {
  const f = new Date(iso), hoy = new Date();
  return f.toDateString() === hoy.toDateString();
}

function esEsteMes(iso) {
  const f = new Date(iso), hoy = new Date();
  return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
}
