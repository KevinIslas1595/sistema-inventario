/* ventas.js — registrar ventas y ver las ultimas */

const sesion = exigirSesion();
document.getElementById("nombreUsuario").textContent = sesion.nombre;

if (sesion.rol !== "admin") {
  document.getElementById("enlaceReportes").style.display = "none";
}

const selectProducto = document.getElementById("producto");
const campoCantidad  = document.getElementById("cantidad");
const campoTotal     = document.getElementById("total");
const aviso          = document.getElementById("aviso");

/* ---------- Llenar la lista de productos --------------------------------- */

function llenarProductos() {
  const anterior = selectProducto.value;
  selectProducto.innerHTML = "";

  listarProductos().forEach(p => {
    const opcion = document.createElement("option");
    opcion.value = p.id;
    opcion.textContent = tienePrecio(p)
      ? `${p.nombre} (${p.categoria}) — ${dinero(p.precio)} · quedan ${p.stock}`
      : `${p.nombre} (${p.categoria}) — sin precio`;
    opcion.disabled = p.stock === 0 || !tienePrecio(p);
    selectProducto.appendChild(opcion);
  });

  if (anterior) selectProducto.value = anterior;
  calcularTotal();
}

/* ---------- Total en vivo ------------------------------------------------ */

function calcularTotal() {
  const p = buscarProducto(selectProducto.value);
  const cantidad = Number(campoCantidad.value) || 0;
  campoTotal.value = p && tienePrecio(p) ? dinero(p.precio * cantidad) : "$0.00";
}

selectProducto.addEventListener("change", calcularTotal);
campoCantidad.addEventListener("input", calcularTotal);

/* ---------- Guardar la venta --------------------------------------------- */

document.getElementById("formVenta").addEventListener("submit", function (evento) {
  evento.preventDefault();

  const resultado = registrarVenta(selectProducto.value, campoCantidad.value);

  aviso.textContent = resultado.mensaje;
  aviso.className = "aviso " + (resultado.ok ? "exito" : "error");

  if (resultado.ok) {
    campoCantidad.value = 1;
    llenarProductos();
    pintarVentas();
  }
});

/* ---------- Tabla de ultimas ventas -------------------------------------- */

function pintarVentas() {
  const ventas = listarVentas().slice().reverse().slice(0, 15);
  const tabla  = document.getElementById("tablaVentas");

  tabla.innerHTML = "";

  ventas.forEach(v => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${fechaCorta(v.fecha)}</td>
      <td>${escapar(v.producto)}</td>
      <td>${v.cantidad}</td>
      <td>${dinero(v.total)}</td>
      <td>${escapar(v.vendedor)}</td>`;
    tabla.appendChild(fila);
  });

  document.getElementById("sinVentas").classList.toggle("oculto", ventas.length > 0);
}

llenarProductos();
pintarVentas();
