/* pedidos.js — pedidos que llegan por WhatsApp: confirmarlos o cancelarlos.
   Al confirmar se descuenta del inventario y se registra la venta. */

// Si no hay sesion, exigirSesion ya mando al login (y recuerda el link del pedido)
const sesion = exigirSesion();
if (sesion) {
  document.getElementById("nombreUsuario").textContent = sesion.nombre;
  if (sesion.rol !== "admin") {
    document.getElementById("enlaceReportes").style.display = "none";
  }
}

const aviso       = document.getElementById("aviso");
const pedidoNuevo = document.getElementById("pedidoNuevo");
let folioAbierto  = null;   // el pedido que se abrio con el link

const ESTADOS = {
  pendiente:  '<span class="etiqueta bajo">Pendiente</span>',
  confirmado: '<span class="etiqueta ok">Confirmado</span>',
  cancelado:  '<span class="etiqueta nada">Cancelado</span>'
};

function mostrarAviso(resultado) {
  aviso.textContent = resultado.mensaje;
  aviso.className = "aviso " + (resultado.ok ? "exito" : "error");
}

/* ---------- Pedido que llego por el link --------------------------------- */

function recibirDesdeTexto(texto) {
  const leido = leerPedidoDeEnlace(texto);
  if (!leido.ok) { mostrarAviso(leido); return; }

  guardarPedido(leido.pedido);
  folioAbierto = leido.pedido.folio;
  pintarTodo();
  pedidoNuevo.scrollIntoView({ behavior: "smooth", block: "start" });
}

function pintarPedidoNuevo() {
  const pedido = folioAbierto && buscarPedido(folioAbierto);
  if (!pedido) { pedidoNuevo.classList.add("oculto"); return; }

  const renglones = pedido.lineas.map(l => {
    const p = buscarProducto(l.id);
    const falta = p && l.cantidad > p.stock && pedido.estado === "pendiente";
    return `<tr>
        <td>${l.cantidad}</td>
        <td>${escapar(l.nombre)} <small class="suave">(${escapar(l.marca)})</small></td>
        <td>${l.precio === null ? "sin precio" : dinero(l.importe)}</td>
        <td>${p ? p.stock : "—"}${falta ? ' <span class="etiqueta nada">No alcanza</span>' : ""}</td>
      </tr>`;
  }).join("");

  let pie;
  if (pedido.estado === "pendiente") {
    pie = `<div class="acciones">
        <button class="boton verde" data-confirmar="${escapar(pedido.folio)}">Confirmar y descontar del inventario</button>
        <button class="boton gris" data-cancelar="${escapar(pedido.folio)}">Cancelar pedido</button>
      </div>`;
  } else if (pedido.estado === "confirmado") {
    pie = `<p class="suave">Confirmado el ${fechaCorta(pedido.confirmado)} por ${escapar(pedido.confirmadoPor)}. Ya se descontó del inventario.</p>`;
  } else {
    pie = '<p class="suave">Este pedido se canceló. No se descontó nada del inventario.</p>';
  }

  pedidoNuevo.innerHTML = `
    <div class="titulo-pedido">
      <h3>Pedido <span class="folio">${escapar(pedido.folio)}</span></h3>
      ${ESTADOS[pedido.estado]}
    </div>
    <div class="tabla-scroll">
      <table>
        <thead><tr><th>Piezas</th><th>Producto</th><th>Importe</th><th>En almacén</th></tr></thead>
        <tbody>${renglones}</tbody>
      </table>
    </div>
    <p class="total-pedido">Total: <strong>${dinero(pedido.total)}</strong> · ${pedido.piezas} ${pedido.piezas === 1 ? "pieza" : "piezas"}</p>
    ${pie}`;
  pedidoNuevo.classList.remove("oculto");
}

/* ---------- Tabla de todos los pedidos ----------------------------------- */

function pintarPedidos() {
  const pedidos = listarPedidos().slice().reverse();
  const tabla = document.getElementById("tablaPedidos");

  tabla.innerHTML = pedidos.map(p => `<tr>
      <td>${fechaCorta(p.fecha)}</td>
      <td><strong>${escapar(p.folio)}</strong></td>
      <td class="productos-pedido">${p.lineas.map(l => `${l.cantidad} x ${escapar(l.nombre)}`).join("<br>")}</td>
      <td>${dinero(p.total)}</td>
      <td>${ESTADOS[p.estado] || escapar(p.estado)}</td>
      <td>${p.estado === "pendiente"
        ? `<div class="acciones">
             <button class="boton chico verde" data-confirmar="${escapar(p.folio)}">Confirmar</button>
             <button class="boton chico gris" data-cancelar="${escapar(p.folio)}">Cancelar</button>
           </div>`
        : "—"}</td>
    </tr>`).join("");

  document.getElementById("sinPedidos").classList.toggle("oculto", pedidos.length > 0);
}

function pintarTodo() {
  pintarPedidoNuevo();
  pintarPedidos();
  marcarPedidosPendientes();
}

/* ---------- Botones ------------------------------------------------------ */

document.addEventListener("click", e => {
  const confirmar = e.target.closest("[data-confirmar]");
  const cancelar  = e.target.closest("[data-cancelar]");

  if (confirmar) {
    mostrarAviso(confirmarPedido(confirmar.dataset.confirmar));
    pintarTodo();
  }
  if (cancelar && confirm(`¿Cancelar el pedido ${cancelar.dataset.cancelar}?`)) {
    mostrarAviso(cancelarPedido(cancelar.dataset.cancelar));
    pintarTodo();
  }
});

document.getElementById("formPegar").addEventListener("submit", e => {
  e.preventDefault();
  recibirDesdeTexto(document.getElementById("textoPegado").value);
});

/* ---------- Arranque ----------------------------------------------------- */

if (sesion) {
  if (location.search.includes("folio=")) {
    recibirDesdeTexto(location.search);
    // Se quita el link de la barra para que al recargar no se vuelva a leer
    history.replaceState(null, "", location.pathname);
  }
  pintarTodo();
}
