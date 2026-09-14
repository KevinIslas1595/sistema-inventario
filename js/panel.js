/* panel.js — pantalla de inventario (agregar, editar, buscar, borrar) */

const sesion = exigirSesion();
document.getElementById("nombreUsuario").textContent = sesion.nombre;

/* El empleado no entra a reportes */
if (sesion.rol !== "admin") {
  document.getElementById("enlaceReportes").style.display = "none";
}

const tabla        = document.getElementById("tablaProductos");
const buscador     = document.getElementById("buscador");
const sinResultados= document.getElementById("sinResultados");
const cajaForm     = document.getElementById("cajaFormulario");
const formProducto = document.getElementById("formProducto");
const aviso        = document.getElementById("aviso");

/* ---------- Mostrar la tabla -------------------------------------------- */

function pintarTabla() {
  const texto = buscador.value.trim().toLowerCase();

  const productos = listarProductos().filter(p =>
    p.nombre.toLowerCase().includes(texto) ||
    p.categoria.toLowerCase().includes(texto)
  );

  tabla.innerHTML = "";

  productos.forEach(p => {
    let etiqueta = '<span class="etiqueta ok">Disponible</span>';
    if (p.stock === 0)            etiqueta = '<span class="etiqueta nada">Agotado</span>';
    else if (p.stock <= p.minimo) etiqueta = '<span class="etiqueta bajo">Queda poco</span>';

    const botonBorrar = sesion.rol === "admin"
      ? `<button class="boton chico rojo" onclick="pedirBorrar(${p.id})">Borrar</button>`
      : "";

    const foto = p.imagen
      ? `<img class="miniatura" src="${escapar(p.imagen)}" alt="">`
      : `<span class="miniatura sin-foto"></span>`;
    const precio = tienePrecio(p)
      ? dinero(p.precio)
      : '<span class="etiqueta bajo">Por confirmar</span>';

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><div class="con-foto">${foto}<span>${escapar(p.nombre)}</span></div></td>
      <td>${escapar(p.categoria)}</td>
      <td>${escapar(p.tipo || "—")}</td>
      <td>${precio}</td>
      <td>${p.stock}</td>
      <td>${etiqueta}</td>
      <td><div class="acciones">
        <button class="boton chico" onclick="editarProducto(${p.id})">Editar</button>
        ${botonBorrar}
      </div></td>`;
    tabla.appendChild(fila);
  });

  sinResultados.classList.toggle("oculto", productos.length > 0);
}

/* ---------- Numeros de arriba ------------------------------------------- */

function pintarResumen() {
  const productos = listarProductos();
  const piezas = productos.reduce((suma, p) => suma + p.stock, 0);
  const valor  = productos.reduce((suma, p) => suma + p.stock * (tienePrecio(p) ? p.precio : 0), 0);
  const bajos  = productosBajos();
  const sinPrecio = productos.filter(p => !tienePrecio(p));

  document.getElementById("totalProductos").textContent  = productos.length;
  document.getElementById("totalPiezas").textContent     = piezas;
  document.getElementById("valorInventario").textContent = dinero(valor);
  document.getElementById("totalBajos").textContent      = bajos.length;

  const avisos = [];
  if (bajos.length) {
    avisos.push("<strong>Hay que resurtir:</strong> " +
      bajos.map(p => `${escapar(p.nombre)} (${p.stock})`).join(", "));
  }
  if (sinPrecio.length) {
    avisos.push(`<strong>${sinPrecio.length} productos sin precio</strong> (no se pueden vender): ` +
      sinPrecio.map(p => escapar(p.nombre)).join(", ") + ". Dale Editar para ponerle precio.");
  }
  const avisoStock = document.getElementById("avisoStock");
  avisoStock.innerHTML = avisos.join("<br><br>");
  avisoStock.classList.toggle("oculto", avisos.length === 0);

  // Sugerencias de categoria en el formulario
  const lista = document.getElementById("categorias");
  lista.innerHTML = "";
  [...new Set(productos.map(p => p.categoria))].forEach(c => {
    const opcion = document.createElement("option");
    opcion.value = c;
    lista.appendChild(opcion);
  });
}

/* ---------- Formulario --------------------------------------------------- */

function mostrarFormulario() {
  formProducto.reset();
  document.getElementById("idProducto").value = "";
  document.getElementById("tituloFormulario").textContent = "Nuevo producto";
  cajaForm.style.display = "block";
  document.getElementById("nombre").focus();
}

function ocultarFormulario() {
  cajaForm.style.display = "none";
}

function editarProducto(id) {
  const p = buscarProducto(id);
  if (!p) return;

  document.getElementById("idProducto").value = p.id;
  document.getElementById("nombre").value     = p.nombre;
  document.getElementById("categoria").value  = p.categoria;
  document.getElementById("tipo").value       = p.tipo || "Dulce";
  document.getElementById("precio").value     = tienePrecio(p) ? p.precio : "";
  document.getElementById("stock").value      = p.stock;
  document.getElementById("minimo").value     = p.minimo;

  document.getElementById("tituloFormulario").textContent = "Editar producto";
  cajaForm.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

formProducto.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const id = document.getElementById("idProducto").value;

  guardarProducto({
    id: id ? Number(id) : null,
    nombre:    document.getElementById("nombre").value.trim(),
    categoria: document.getElementById("categoria").value.trim(),
    tipo:      document.getElementById("tipo").value,
    precio:    Number(document.getElementById("precio").value),
    stock:     Number(document.getElementById("stock").value),
    minimo:    Number(document.getElementById("minimo").value)
  });

  ocultarFormulario();
  mostrarAviso(id ? "Producto actualizado." : "Producto agregado.");
  refrescar();
});

/* ---------- Borrar ------------------------------------------------------- */

function pedirBorrar(id) {
  const p = buscarProducto(id);
  if (!p) return;

  if (confirm(`Seguro que quieres borrar "${p.nombre}"?`)) {
    borrarProducto(id);
    mostrarAviso("Producto borrado.");
    refrescar();
  }
}

/* ---------- Utilidades --------------------------------------------------- */

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.classList.remove("oculto");
  setTimeout(() => aviso.classList.add("oculto"), 3000);
}

function refrescar() {
  pintarResumen();
  pintarTabla();
}

buscador.addEventListener("input", pintarTabla);
refrescar();
