/* login.js — pantalla de inicio de sesion */

// Si ya habia sesion abierta, se va derecho al inventario
// (o a la pagina a la que iba, por ejemplo el link de un pedido)
if (sesionActual()) {
  window.location.href = paginaDespuesDeEntrar();
}

const formLogin = document.getElementById("formLogin");
const aviso     = document.getElementById("aviso");

formLogin.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const correo = document.getElementById("correo").value;
  const clave  = document.getElementById("clave").value;

  const sesion = iniciarSesion(correo, clave);

  if (sesion) {
    window.location.href = paginaDespuesDeEntrar();
  } else {
    aviso.textContent = "Correo o contrasena incorrectos.";
    aviso.classList.remove("oculto");
  }
});
