# Sistema de Inventario y Punto de Venta

Sistema web para administrar el inventario de una tienda: registrar productos,
vender, descontar el stock automaticamente y ver reportes de ventas.

**Ver funcionando:** _(pendiente de publicar)_

---

## Capturas

_(pendiente: agregar imagenes en la carpeta `img/`)_

| Login | Inventario | Reportes |
|-------|------------|----------|
| ![Login](img/captura-login.png) | ![Inventario](img/captura-panel.png) | ![Reportes](img/captura-reportes.png) |

---

## Usuario de prueba

Para probar el sistema sin registrarse:

| Rol | Correo | Contrasena |
|-----|--------|------------|
| Administrador | `admin@demo.com` | `demo123` |
| Empleado | `empleado@demo.com` | `demo123` |

El administrador puede borrar productos y ver reportes. El empleado solo vende.

---

## Que hace

- **Login con roles** — administrador y empleado ven cosas distintas.
- **Inventario completo** — agregar, editar, buscar y borrar productos.
- **Registro de ventas** — al vender, el stock baja solo.
- **Alerta de stock bajo** — avisa cuando quedan pocas piezas.
- **Reportes** — ventas del dia y del mes, con grafica y productos mas vendidos.
- **Diseno responsivo** — funciona en computadora y en celular.

---

## Tecnologias

- HTML5, CSS3 y JavaScript (sin frameworks)
- Almacenamiento local del navegador (`localStorage`) en el modo demo
- Preparado para conectarse a **Supabase** (base de datos y login reales)

---

## Como usarlo en tu computadora

1. Descarga o clona el repositorio:

   ```bash
   git clone https://github.com/KevinIslas1595/sistema-inventario.git
   ```

2. Abre la carpeta y haz doble clic en `index.html`.

Eso es todo: no necesita instalar nada.

---

## Estructura del proyecto

```
sistema-inventario/
├── index.html        Pantalla de inicio de sesion
├── panel.html        Inventario (lista de productos)
├── ventas.html       Registrar una venta
├── reportes.html     Graficas y totales
├── css/
│   └── estilos.css   Todos los estilos
├── js/
│   ├── datos.js      Guardar y leer la informacion
│   ├── login.js      Inicio de sesion
│   ├── panel.js      Inventario
│   ├── ventas.js     Ventas
│   └── reportes.js   Reportes
└── img/              Imagenes y capturas
```

---

## Pendientes / siguientes pasos

- [ ] Conectar con Supabase para que los datos se guarden en la nube
- [ ] Publicar en GitHub Pages
- [ ] Agregar capturas de pantalla al README
- [ ] Exportar reportes a Excel
- [ ] Impresion de ticket de venta

---

## Autor

**Kevin Islas** — [GitHub](https://github.com/KevinIslas1595)
