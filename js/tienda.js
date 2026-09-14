/* tienda.js — pagina publica de venta: catalogo, filtros y carrito.
   Lee los productos del mismo inventario (datos.js), asi que el stock
   y los precios que ve el cliente son los del almacen. */

const $ = id => document.getElementById(id);

/* ---------- Colecciones (lo que sale en el banner) ------------------------ */

const COLECCIONES = {
  "todos":          { hash: "todos",          titulo: "Todos los productos",
                      texto: "Gomitas y cacahuates de las marcas que más se venden." },
  "Gomitas Lucky":  { hash: "gomitas-lucky",  titulo: "Gomitas Lucky",
                      texto: "Gomitas de grenetina en bolsa de 1 kg: clásicas, neón y picositas." },
  "Dulces Jovy":    { hash: "dulces-jovy",    titulo: "Dulces Jovy",
                      texto: "Rings, worms, bears y tiburones para tu negocio o tu fiesta." },
  "Cacahuates Sol": { hash: "cacahuates-sol", titulo: "Cacahuates Sol",
                      texto: "Japonés, español, garapiñado, enchilado y botana surtida." },
  "Enchilado":      { hash: "enchilados",     titulo: "Enchilados",
                      texto: "Para los que le entran al chile: gomitas picositas y cacahuates enchilados." }
};

const TIPOS = ["Dulce", "Enchilado", "Salado"];

/* ---------- Estado de la pagina ------------------------------------------ */

const filtros = {
  marcas: new Set(),
  tipos: new Set(),
  disponibles: new Set(),   // "si" = en existencia, "no" = agotado
  min: null,
  max: null,
  texto: "",
  orden: "relevantes"
};

let carrito = leerCarrito();   // [{ id, cantidad }]

/* ---------- Logo --------------------------------------------------------- */

$("logo").textContent = NOMBRE_TIENDA;
$("logoPie").textContent = NOMBRE_TIENDA;
document.title = NOMBRE_TIENDA + " | Gomitas y cacahuates";

/* ---------- Filtros: dibujar las casillas -------------------------------- */

function casilla(grupo, valor, texto, cuantos) {
  return `<label class="opcion">
      <input type="checkbox" data-grupo="${grupo}" value="${escapar(valor)}">
      <span>${escapar(texto)}</span>
      <small>(${cuantos})</small>
    </label>`;
}

function pintarCasillas() {
  const productos = listarProductos();
  const marcas = [...new Set(productos.map(p => p.categoria))];

  $("filtroMarca").innerHTML = marcas
    .map(m => casilla("marcas", m, m, productos.filter(p => p.categoria === m).length))
    .join("");

  $("filtroTipo").innerHTML = TIPOS
    .filter(t => productos.some(p => p.tipo === t))
    .map(t => casilla("tipos", t, t === "Enchilado" ? "Enchilado / picosito" : t,
                      productos.filter(p => p.tipo === t).length))
    .join("");

  $("filtroDisponible").innerHTML =
    casilla("disponibles", "si", "En existencia", productos.filter(p => p.stock > 0).length) +
    casilla("disponibles", "no", "Agotado",       productos.filter(p => p.stock === 0).length);

  document.querySelectorAll(".filtros input[type=checkbox]").forEach(c => {
    c.checked = filtros[c.dataset.grupo].has(c.value);
    c.addEventListener("change", () => {
      c.checked ? filtros[c.dataset.grupo].add(c.value) : filtros[c.dataset.grupo].delete(c.value);
      pintarTodo();
    });
  });
}

function marcarCasillas() {
  document.querySelectorAll(".filtros input[type=checkbox]").forEach(c => {
    c.checked = filtros[c.dataset.grupo].has(c.value);
  });
}

/* ---------- Aplicar filtros y orden -------------------------------------- */

function productosVisibles() {
  const texto = filtros.texto.toLowerCase();

  const lista = listarProductos().filter(p => {
    if (filtros.marcas.size && !filtros.marcas.has(p.categoria)) return false;
    if (filtros.tipos.size  && !filtros.tipos.has(p.tipo))       return false;
    if (filtros.disponibles.size && !filtros.disponibles.has(p.stock > 0 ? "si" : "no")) return false;
    if (filtros.min !== null && !(tienePrecio(p) && p.precio >= filtros.min)) return false;
    if (filtros.max !== null && !(tienePrecio(p) && p.precio <= filtros.max)) return false;
    if (texto && !(p.nombre + " " + p.categoria + " " + (p.tipo || "")).toLowerCase().includes(texto)) return false;
    return true;
  });

  // Los que no tienen precio siempre al final cuando se ordena por precio
  const precio = (p, sinPrecio) => tienePrecio(p) ? p.precio : sinPrecio;
  if (filtros.orden === "precio-menor") lista.sort((a, b) => precio(a, Infinity) - precio(b, Infinity));
  if (filtros.orden === "precio-mayor") lista.sort((a, b) => precio(b, -Infinity) - precio(a, -Infinity));
  if (filtros.orden === "nombre")       lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return lista;
}

/* ---------- Tarjetas de producto ----------------------------------------- */

function tarjeta(p) {
  const agotado = p.stock === 0;
  const conPrecio = tienePrecio(p);

  const etiquetas = [];
  if (agotado)                       etiquetas.push('<span class="sello agotado">Agotado</span>');
  else if (p.stock <= p.minimo)      etiquetas.push(`<span class="sello pocas">Quedan ${p.stock}</span>`);
  if (p.tipo === "Enchilado")        etiquetas.push('<span class="sello picante">Picosito</span>');

  let boton;
  if (agotado)         boton = '<button class="boton-agregar" disabled>Agotado</button>';
  else if (!conPrecio) boton = '<button class="boton-agregar" disabled>Próximamente</button>';
  else                 boton = `<button class="boton-agregar" data-agregar="${p.id}">Agregar al carrito</button>`;

  return `<article class="producto${agotado ? " es-agotado" : ""}">
      <div class="producto-foto">
        <div class="sellos">${etiquetas.join("")}</div>
        ${p.imagen
          ? `<img src="${escapar(p.imagen)}" alt="${escapar(p.nombre)}" loading="lazy">`
          : '<div class="foto-vacia">Sin foto</div>'}
      </div>
      <div class="producto-info">
        <p class="producto-marca">${escapar(p.categoria)}</p>
        <h3 class="producto-nombre">${escapar(p.nombre)}</h3>
        <p class="producto-precio">${conPrecio
          ? `${dinero(p.precio)} <span>MXN</span>`
          : '<span class="por-confirmar">Precio por confirmar</span>'}</p>
        ${boton}
      </div>
    </article>`;
}

function pintarProductos() {
  const lista = productosVisibles();
  $("rejilla").innerHTML = lista.map(tarjeta).join("");
  $("conteo").textContent = lista.length === 1 ? "1 producto" : `${lista.length} productos`;
  $("sinResultados").classList.toggle("oculto", lista.length > 0);
}

/* ---------- Banner ------------------------------------------------------- */

function coleccionActual() {
  const soloMarca = filtros.marcas.size === 1 && !filtros.tipos.size;
  if (soloMarca) return [...filtros.marcas][0];
  const soloEnchilado = !filtros.marcas.size && filtros.tipos.size === 1 && filtros.tipos.has("Enchilado");
  if (soloEnchilado) return "Enchilado";
  if (!filtros.marcas.size && !filtros.tipos.size) return "todos";
  return null;
}

function pintarBanner() {
  const clave = coleccionActual();
  const col = COLECCIONES[clave] || { titulo: "Resultados", texto: "Productos que coinciden con tus filtros." };

  $("tituloColeccion").textContent = col.titulo;
  $("textoColeccion").textContent  = col.texto;
  $("migaActual").textContent      = col.titulo;
  $("banner").dataset.coleccion    = clave || "mixto";

  // Tres fotos de la coleccion para adornar el banner
  const fotos = productosVisibles().filter(p => p.imagen).slice(0, 3);
  $("bannerFotos").innerHTML = fotos.map(p => `<img src="${escapar(p.imagen)}" alt="">`).join("");

  document.querySelectorAll("[data-coleccion]").forEach(a => {
    a.classList.toggle("activo", a.dataset.coleccion === clave && a.closest(".menu"));
  });
}

function pintarTodo() {
  pintarBanner();
  pintarProductos();
}

/* ---------- Menu de colecciones ------------------------------------------ */

function abrirColeccion(clave, subir) {
  filtros.marcas.clear();
  filtros.tipos.clear();
  if (TIPOS.includes(clave)) filtros.tipos.add(clave);
  else if (clave !== "todos") filtros.marcas.add(clave);

  marcarCasillas();
  pintarTodo();
  cerrarMenu();
  if (subir) $("banner").scrollIntoView({ behavior: "smooth" });
}

document.querySelectorAll("[data-coleccion]").forEach(a => {
  a.addEventListener("click", evento => {
    evento.preventDefault();
    const clave = a.dataset.coleccion;
    history.replaceState(null, "", "#" + COLECCIONES[clave].hash);
    abrirColeccion(clave, true);
  });
});

function coleccionDesdeHash() {
  const hash = location.hash.replace("#", "");
  return Object.keys(COLECCIONES).find(k => COLECCIONES[k].hash === hash) || "todos";
}

/* ---------- Buscador, precio y orden ------------------------------------- */

$("buscar").addEventListener("input", e => { filtros.texto = e.target.value.trim(); pintarTodo(); });
$("orden").addEventListener("change", e => { filtros.orden = e.target.value; pintarProductos(); });

function leerPrecio(campo) {
  const valor = $(campo).value;
  return valor === "" ? null : Number(valor);
}
["precioMin", "precioMax"].forEach(campo => $(campo).addEventListener("input", () => {
  filtros.min = leerPrecio("precioMin");
  filtros.max = leerPrecio("precioMax");
  pintarTodo();
}));

function limpiarFiltros() {
  filtros.marcas.clear(); filtros.tipos.clear(); filtros.disponibles.clear();
  filtros.min = filtros.max = null;
  filtros.texto = "";
  $("precioMin").value = $("precioMax").value = $("buscar").value = "";
  marcarCasillas();
  history.replaceState(null, "", location.pathname);
  pintarTodo();
}
$("limpiarFiltros").addEventListener("click", limpiarFiltros);
$("limpiarFiltros2").addEventListener("click", limpiarFiltros);

/* ---------- Paneles que se abren en celular ------------------------------- */

function abrirPanel(id)  { $(id).classList.add("abierto"); $("cortina").classList.remove("oculto"); document.body.classList.add("sin-scroll"); }
function cerrarPaneles() {
  ["filtros", "carrito", "menu"].forEach(id => $(id).classList.remove("abierto"));
  $("carrito").setAttribute("aria-hidden", "true");
  $("cortina").classList.add("oculto");
  document.body.classList.remove("sin-scroll");
}
function cerrarMenu() { $("menu").classList.remove("abierto"); if (!$("carrito").classList.contains("abierto") && !$("filtros").classList.contains("abierto")) cerrarPaneles(); }

$("abrirFiltros").addEventListener("click", () => abrirPanel("filtros"));
$("cerrarFiltros").addEventListener("click", cerrarPaneles);
$("verResultados").addEventListener("click", cerrarPaneles);
$("abrirMenu").addEventListener("click", () => $("menu").classList.toggle("abierto"));
$("cortina").addEventListener("click", cerrarPaneles);
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarPaneles(); });

/* =========================================================================
   CARRITO
   ========================================================================= */

function leerCarrito() {
  try { return JSON.parse(localStorage.getItem("carrito")) || []; }
  catch { return []; }
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

/* Quita del carrito lo que ya no existe o no se puede vender, y ajusta
   las cantidades al stock que hay */
function revisarCarrito() {
  carrito = carrito
    .map(item => {
      const p = buscarProducto(item.id);
      if (!p || !tienePrecio(p) || p.stock === 0) return null;
      return { id: p.id, cantidad: Math.min(item.cantidad, p.stock) };
    })
    .filter(Boolean);
  guardarCarrito();
}

function agregarAlCarrito(id) {
  const p = buscarProducto(id);
  if (!p || !tienePrecio(p) || p.stock === 0) return;

  const item = carrito.find(i => i.id === p.id);
  const enCarrito = item ? item.cantidad : 0;

  if (enCarrito >= p.stock) {
    mostrarToast(`Solo hay ${p.stock} piezas de ${p.nombre}.`);
    return;
  }

  item ? item.cantidad++ : carrito.push({ id: p.id, cantidad: 1 });
  guardarCarrito();
  pintarCarrito();
  mostrarToast(`Agregaste ${p.nombre} al carrito.`);
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(i => i.id === id);
  const p = buscarProducto(id);
  if (!item || !p) return;

  item.cantidad = Math.max(0, Math.min(p.stock, item.cantidad + cambio));
  if (item.cantidad === 0) carrito = carrito.filter(i => i.id !== id);
  guardarCarrito();
  pintarCarrito();
}

function pintarCarrito() {
  const piezas = carrito.reduce((s, i) => s + i.cantidad, 0);
  $("contadorCarrito").textContent = piezas;
  $("contadorCarrito").classList.toggle("oculto", piezas === 0);

  if (!carrito.length) {
    $("carritoLista").innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
    $("carritoPie").classList.add("oculto");
    return;
  }

  let total = 0;
  $("carritoLista").innerHTML = carrito.map(item => {
    const p = buscarProducto(item.id);
    const importe = p.precio * item.cantidad;
    total += importe;
    return `<div class="linea">
        <img src="${escapar(p.imagen || "")}" alt="">
        <div class="linea-info">
          <p class="producto-marca">${escapar(p.categoria)}</p>
          <p class="linea-nombre">${escapar(p.nombre)}</p>
          <div class="cantidad">
            <button data-cambiar="${p.id}" data-paso="-1" aria-label="Quitar uno">&minus;</button>
            <span>${item.cantidad}</span>
            <button data-cambiar="${p.id}" data-paso="1" aria-label="Agregar uno" ${item.cantidad >= p.stock ? "disabled" : ""}>+</button>
          </div>
        </div>
        <div class="linea-precio">
          <strong>${dinero(importe)}</strong>
          <button class="boton-texto" data-quitar="${p.id}">Quitar</button>
        </div>
      </div>`;
  }).join("");

  $("carritoTotal").textContent = dinero(total);
  $("carritoPie").classList.remove("oculto");
}

function abrirCarrito() {
  $("avisoCarrito").classList.add("oculto");
  revisarCarrito();
  pintarCarrito();
  abrirPanel("carrito");
  $("carrito").setAttribute("aria-hidden", "false");
}

/* Finalizar: se registra una venta por producto y baja el stock */
function finalizarPedido() {
  revisarCarrito();
  if (!carrito.length) { pintarCarrito(); return; }

  // Primero revisar que todo alcance, para no vender la mitad del pedido
  for (const item of carrito) {
    const p = buscarProducto(item.id);
    if (item.cantidad > p.stock) {
      avisoCarrito(`Solo quedan ${p.stock} piezas de ${p.nombre}.`, "error");
      return;
    }
  }

  let total = 0, piezas = 0;
  for (const item of carrito) {
    const resultado = registrarVenta(item.id, item.cantidad, "Tienda en línea");
    if (!resultado.ok) { avisoCarrito(resultado.mensaje, "error"); return; }
    total += buscarProducto(item.id).precio * item.cantidad;
    piezas += item.cantidad;
  }

  carrito = [];
  guardarCarrito();
  pintarCarrito();
  pintarCasillas();
  pintarProductos();

  $("carritoLista").innerHTML = `<div class="gracias">
      <p class="gracias-titulo">¡Gracias por tu pedido!</p>
      <p>${piezas} ${piezas === 1 ? "pieza" : "piezas"} por ${dinero(total)}.</p>
      <p>Ya se descontó del inventario.</p>
    </div>`;
}

function avisoCarrito(texto) {
  $("avisoCarrito").textContent = texto;
  $("avisoCarrito").classList.remove("oculto");
}

$("abrirCarrito").addEventListener("click", abrirCarrito);
$("cerrarCarrito").addEventListener("click", cerrarPaneles);
$("finalizar").addEventListener("click", finalizarPedido);

// Un solo "escuchador" para los botones que se crean dinamicamente
document.addEventListener("click", e => {
  const agregar = e.target.closest("[data-agregar]");
  const cambiar = e.target.closest("[data-cambiar]");
  const quitar  = e.target.closest("[data-quitar]");
  if (agregar) agregarAlCarrito(Number(agregar.dataset.agregar));
  if (cambiar) cambiarCantidad(Number(cambiar.dataset.cambiar), Number(cambiar.dataset.paso));
  if (quitar)  cambiarCantidad(Number(quitar.dataset.quitar), -Infinity);
});

/* ---------- Mensajito flotante ------------------------------------------- */

let temporizadorToast;
function mostrarToast(texto) {
  $("toast").textContent = texto;
  $("toast").classList.remove("oculto");
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => $("toast").classList.add("oculto"), 2200);
}

/* ---------- Arranque ----------------------------------------------------- */

pintarCasillas();
revisarCarrito();
pintarCarrito();
abrirColeccion(coleccionDesdeHash(), false);
