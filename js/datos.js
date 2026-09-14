/* =========================================================================
   datos.js
   Aqui vive TODA la informacion del sistema.
   Por ahora se guarda en el navegador (localStorage) para que el sistema
   funcione sin instalar nada. Cuando conectes Supabase, solo hay que
   cambiar las funciones de este archivo: el resto de la pagina no se toca.
   ========================================================================= */

/* --- Nombre de la tienda (se muestra en la pagina de venta) -------------- */
const NOMBRE_TIENDA = "Dulcería Premium";

/* --- Usuarios de prueba -------------------------------------------------- */
const USUARIOS = [
  { correo: "admin@demo.com",    clave: "demo123", nombre: "Kevin (Admin)", rol: "admin" },
  { correo: "empleado@demo.com", clave: "demo123", nombre: "Ana (Caja)",    rol: "empleado" }
];

/* --- Productos con los que arranca el sistema ---------------------------- */
/* categoria = marca/coleccion. tipo = "Dulce" o "Enchilado".
   precio: null = todavia no tiene precio (no se puede vender hasta ponerlo). */
const STOCK_INICIAL = 100;
const MINIMO_INICIAL = 20;

function producto(id, nombre, categoria, tipo, precio, imagen) {
  return { id, nombre, categoria, tipo, precio, stock: STOCK_INICIAL, minimo: MINIMO_INICIAL,
           imagen: "img/productos/" + imagen + ".jpg" };
}

const PRODUCTOS_INICIALES = [
  // Gomitas Lucky Gummys (bolsa 1 kg) — precios de la lista "Ventas productos Lucky"
  producto( 1, "Aros de Durazno",       "Gomitas Lucky", "Dulce",     86.00, "lucky-aros-durazno"),
  producto( 2, "Tiburones",             "Gomitas Lucky", "Dulce",     86.00, "lucky-tiburones"),
  producto( 3, "Lombrices",             "Gomitas Lucky", "Dulce",     80.80, "lucky-lombrices"),
  producto( 4, "Ositos",                "Gomitas Lucky", "Dulce",     80.80, "lucky-ositos"),
  producto( 5, "Frutitas",              "Gomitas Lucky", "Dulce",     72.30, "lucky-frutitas"),
  producto( 6, "Aros de Manzana",       "Gomitas Lucky", "Dulce",     86.00, "lucky-aros-manzana"),
  producto( 7, "Mangusano",             "Gomitas Lucky", "Enchilado", 70.70, "lucky-mangusano"),
  producto( 8, "Manguitos",             "Gomitas Lucky", "Enchilado", 70.70, "lucky-manguitos"),
  producto( 9, "Corazones",             "Gomitas Lucky", "Dulce",     80.80, "lucky-corazones"),
  producto(10, "Cubitos Neón",          "Gomitas Lucky", "Dulce",     76.20, "lucky-cubitos-neon"),
  producto(11, "Lombrices Neón",        "Gomitas Lucky", "Dulce",     76.20, "lucky-lombriz-neon"),
  producto(12, "Ositos Neón",           "Gomitas Lucky", "Dulce",     76.20, "lucky-ositos-neon"),
  producto(13, "Ositos Enchilados",     "Gomitas Lucky", "Enchilado", 76.20, "lucky-ositos-enchilados"),
  producto(14, "Orugas",                "Gomitas Lucky", "Dulce",     null,  "lucky-orugas"),
  producto(15, "Gajos de Naranja Enchilados", "Gomitas Lucky", "Enchilado", null, "lucky-gajos-naranja"),

  // Dulces Jovy
  producto(16, "Rings Sabor Sandía",    "Dulces Jovy", "Dulce", null, "jovy-rings-sandia"),
  producto(17, "Rings Sabor Manzana",   "Dulces Jovy", "Dulce", null, "jovy-rings-manzana"),
  producto(18, "Rings Sabor Durazno",   "Dulces Jovy", "Dulce", null, "jovy-rings-durazno"),
  producto(19, "Worms Gummies",         "Dulces Jovy", "Dulce", null, "jovy-worms"),
  producto(20, "Worms Gummies Neón",    "Dulces Jovy", "Dulce", null, "jovy-worms-neon"),
  producto(21, "Blue Sharks",           "Dulces Jovy", "Dulce", null, "jovy-blue-sharks"),
  producto(22, "Frutástika Gummies",    "Dulces Jovy", "Dulce", null, "jovy-frutastika"),
  producto(23, "Bears Gummies",         "Dulces Jovy", "Dulce", null, "jovy-bears"),
  producto(24, "Bears Neón",            "Dulces Jovy", "Dulce", null, "jovy-bears-neon"),
  producto(25, "Neon Sour Rings",       "Dulces Jovy", "Dulce", null, "jovy-neon-sour-rings"),
  producto(26, "Sharks Mix",            "Dulces Jovy", "Dulce", null, "jovy-sharks-mix"),
  producto(27, "Watermelon Slices",     "Dulces Jovy", "Dulce", null, "jovy-watermelon-slices"),

  // Cacahuates Sol
  producto(28, "Cacahuate Estilo Holandés",         "Cacahuates Sol", "Enchilado", null, "sol-holandes"),
  producto(29, "Cacahuate Garapiñado con Ajonjolí", "Cacahuates Sol", "Dulce",     null, "sol-garapinado-ajonjoli"),
  producto(30, "Cacahuate Garapiñado",              "Cacahuates Sol", "Dulce",     null, "sol-garapinado"),
  producto(31, "Botana Surtida",                    "Cacahuates Sol", "Enchilado", null, "sol-botana-surtida"),
  producto(32, "Cacahuate Tipo Español",            "Cacahuates Sol", "Salado",    null, "sol-espanol"),
  producto(33, "Cacahuate Tipo Español con Ajo",    "Cacahuates Sol", "Salado",    null, "sol-espanol-ajo"),
  producto(34, "Cacahuate Estilo Japonés",          "Cacahuates Sol", "Salado",    null, "sol-japones"),
  producto(35, "Cacahuate Enchilado",               "Cacahuates Sol", "Enchilado", null, "sol-enchilado")
];

/* Si se cambia la lista de arriba, sube este numero para que los navegadores
   que ya tenian datos viejos carguen la lista nueva. */
const VERSION_CATALOGO = 2;

/* --- Utilidades internas ------------------------------------------------- */

function leer(llave, porDefecto) {
  const guardado = localStorage.getItem(llave);
  return guardado ? JSON.parse(guardado) : porDefecto;
}

function escribir(llave, valor) {
  localStorage.setItem(llave, JSON.stringify(valor));
}

/* La primera vez que se abre el sistema (o si cambio el catalogo),
   se cargan los productos iniciales */
function prepararDatos() {
  if (leer("versionCatalogo", 0) !== VERSION_CATALOGO) {
    escribir("productos", PRODUCTOS_INICIALES);
    escribir("ventas", []);
    escribir("versionCatalogo", VERSION_CATALOGO);
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
  window.location.href = "login.html";
}

/* Se llama al inicio de cada pagina privada: si no hay sesion, te saca */
function exigirSesion() {
  const sesion = sesionActual();
  if (!sesion) {
    window.location.href = "login.html";
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

function tienePrecio(producto) {
  return typeof producto.precio === "number" && producto.precio > 0;
}

/* vendedor: quien vendio. Si no se pasa, se usa el usuario con sesion. */
function registrarVenta(idProducto, cantidad, vendedor) {
  const producto = buscarProducto(idProducto);
  cantidad = Number(cantidad);

  if (!producto)                return { ok: false, mensaje: "El producto no existe." };
  if (!tienePrecio(producto))   return { ok: false, mensaje: `${producto.nombre} todavia no tiene precio.` };
  if (!Number.isInteger(cantidad) || cantidad <= 0)
                                return { ok: false, mensaje: "La cantidad debe ser un numero entero mayor a cero." };
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
    total: Math.round(producto.precio * cantidad * 100) / 100,
    fecha: new Date().toISOString(),
    vendedor: vendedor || (sesionActual() ? sesionActual().nombre : "—")
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

function precioTexto(producto) {
  return tienePrecio(producto) ? dinero(producto.precio) : "Por confirmar";
}

/* Para meter texto escrito por el usuario dentro de HTML sin que se rompa */
function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
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
