/* reportes.js — totales, grafica y productos mas vendidos (solo admin) */

const sesion = exigirSesion();
document.getElementById("nombreUsuario").textContent = sesion.nombre;
marcarPedidosPendientes();

/* Un empleado no deberia ver los reportes */
if (sesion.rol !== "admin") {
  alert("Esta seccion es solo para administradores.");
  window.location.href = "panel.html";
}

const ventas = listarVentas();

/* ---------- Numeros de arriba -------------------------------------------- */

const ventasHoy = ventas.filter(v => esHoy(v.fecha));
const ventasMes = ventas.filter(v => esEsteMes(v.fecha));

const dineroHoy = ventasHoy.reduce((s, v) => s + v.total, 0);
const dineroMes = ventasMes.reduce((s, v) => s + v.total, 0);
const piezasMes = ventasMes.reduce((s, v) => s + v.cantidad, 0);
const promedio  = ventasMes.length ? dineroMes / ventasMes.length : 0;

document.getElementById("ventasHoy").textContent      = dinero(dineroHoy);
document.getElementById("ventasMes").textContent      = dinero(dineroMes);
document.getElementById("piezasMes").textContent      = piezasMes;
document.getElementById("ticketPromedio").textContent = dinero(promedio);

/* ---------- Grafica de los ultimos 7 dias -------------------------------- */

function pintarGrafica() {
  const dias = [];

  for (let i = 6; i >= 0; i--) {
    const dia = new Date();
    dia.setDate(dia.getDate() - i);

    const total = ventas
      .filter(v => new Date(v.fecha).toDateString() === dia.toDateString())
      .reduce((s, v) => s + v.total, 0);

    dias.push({
      etiqueta: dia.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }),
      total: total
    });
  }

  const mayor = Math.max(...dias.map(d => d.total), 1);
  const grafica = document.getElementById("grafica");
  grafica.innerHTML = "";

  dias.forEach(d => {
    const altura = Math.round((d.total / mayor) * 100);

    const columna = document.createElement("div");
    columna.className = "columna";
    columna.innerHTML = `
      <div class="barra-valor">${d.total ? dinero(d.total) : ""}</div>
      <div class="barra" style="height:${altura}%" title="${dinero(d.total)}"></div>
      <div class="etiqueta-x">${d.etiqueta}</div>`;
    grafica.appendChild(columna);
  });
}

/* ---------- Productos mas vendidos --------------------------------------- */

function pintarTop() {
  const resumen = {};

  ventas.forEach(v => {
    if (!resumen[v.producto]) resumen[v.producto] = { piezas: 0, dinero: 0 };
    resumen[v.producto].piezas += v.cantidad;
    resumen[v.producto].dinero += v.total;
  });

  const lista = Object.entries(resumen)
    .sort((a, b) => b[1].piezas - a[1].piezas)
    .slice(0, 10);

  const tabla = document.getElementById("tablaTop");
  tabla.innerHTML = "";

  lista.forEach(([nombre, datos], posicion) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${posicion + 1}</td>
      <td>${escapar(nombre)}</td>
      <td>${datos.piezas}</td>
      <td>${dinero(datos.dinero)}</td>`;
    tabla.appendChild(fila);
  });

  document.getElementById("sinDatos").classList.toggle("oculto", lista.length > 0);
}

pintarGrafica();
pintarTop();
