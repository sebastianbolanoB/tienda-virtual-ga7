/* ============================================================
   app.js · Funciones compartidas por todas las páginas
   - Utilidades (formato de moneda, almacenamiento, escape HTML)
   - Sesión de usuario, carrito y pedidos (localStorage)
   - Componentes: tarjeta de producto, estrellas, avisos (toast),
     ventana de confirmación, menú móvil y contador del carrito
   - Validación accesible de formularios
   ============================================================ */
'use strict';

/* ---------- Utilidades ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const formatoCOP = n => n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const escapar = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const parametro = nombre => new URLSearchParams(location.search).get(nombre);

const Almacen = {
  leer(clave, porDefecto) {
    try { return JSON.parse(localStorage.getItem(clave)) ?? porDefecto; } catch { return porDefecto; }
  },
  guardar(clave, valor) { localStorage.setItem(clave, JSON.stringify(valor)); }
};

/* ---------- Catálogo ---------- */
const Catalogo = {
  producto: id => PRODUCTOS.find(p => p.id_producto === Number(id)),
  categoria: id => CATEGORIAS.find(c => c.id_categoria === Number(id)),
  marca: id => MARCAS.find(m => m.id_marca === Number(id)),
  /* Incluye la categoría y sus subcategorías (relación recursiva id_categoria_padre) */
  idsConHijas(id) {
    const ids = [Number(id)];
    CATEGORIAS.filter(c => c.id_categoria_padre === Number(id)).forEach(c => ids.push(c.id_categoria));
    return ids;
  },
  resenas: id => [...RESENAS_BASE, ...Almacen.leer('resenas', [])].filter(r => r.id_producto === Number(id)),
  promedio(id) {
    const r = this.resenas(id);
    return r.length ? r.reduce((s, x) => s + x.calificacion, 0) / r.length : 0;
  }
};

/* ---------- Sesión ---------- */
const Sesion = {
  usuario: () => Almacen.leer('sesion', null),
  iniciar(u) { Almacen.guardar('sesion', { id_usuario: u.id_usuario, nombre: u.nombre, apellido: u.apellido, correo: u.correo }); },
  cerrar() { localStorage.removeItem('sesion'); },
  /* Redirige a login si la página exige sesión */
  exigir() {
    if (!this.usuario()) { location.href = 'login.html?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search); return false; }
    return true;
  }
};
/* Hash SHA-256 de la contraseña: en el navegador nunca se guarda el texto plano */
async function hashTexto(texto) {
  const datos = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
/* Usuario de demostración para probar el prototipo */
async function asegurarUsuarioDemo() {
  const usuarios = Almacen.leer('usuarios', []);
  if (!usuarios.some(u => u.correo === 'demo@tiendavirtual.co')) {
    usuarios.push({ id_usuario: 1, tipo_documento: 'CC', numero_documento: '1000000000', nombre: 'Usuario', apellido: 'Demo',
      correo: 'demo@tiendavirtual.co', telefono: '3000000000', hash: await hashTexto('Demo1234') });
    Almacen.guardar('usuarios', usuarios);
  }
}

/* ---------- Carrito ---------- */
const Carrito = {
  items: () => Almacen.leer('carrito', []),
  guardar(items) { Almacen.guardar('carrito', items); actualizarContador(); },
  cantidadTotal() { return this.items().reduce((s, i) => s + i.cantidad, 0); },
  agregar(id, cantidad = 1) {
    const p = Catalogo.producto(id); const items = this.items();
    const it = items.find(i => i.id_producto === p.id_producto);
    const actual = it ? it.cantidad : 0;
    if (actual + cantidad > p.stock) { aviso(`Solo hay ${p.stock} unidades disponibles de ${p.nombre}.`, 'error'); return false; }
    if (it) it.cantidad += cantidad; else items.push({ id_producto: p.id_producto, cantidad });
    this.guardar(items); aviso(`${p.nombre} se agregó al carrito.`, 'ok'); return true;
  },
  cambiar(id, cantidad) {
    const items = this.items(); const it = items.find(i => i.id_producto === id);
    if (it) it.cantidad = cantidad; this.guardar(items);
  },
  quitar(id) { this.guardar(this.items().filter(i => i.id_producto !== id)); },
  vaciar() { this.guardar([]); },
  /* Calcula subtotal, envío y total (misma regla que pedido.total en la BD) */
  resumen() {
    const subtotal = this.items().reduce((s, i) => s + Catalogo.producto(i.id_producto).precio * i.cantidad, 0);
    const envio = subtotal === 0 || subtotal >= ENVIO.gratisDesde ? 0 : ENVIO.costo;
    return { subtotal, envio, total: subtotal + envio };
  }
};

/* ---------- Componentes de interfaz ---------- */
function estrellas(valor, etiqueta = true) {
  const llenas = Math.round(valor);
  const txt = etiqueta ? `<span class="solo-lectores">Calificación ${valor.toFixed(1)} de 5</span>` : '';
  return `<span class="estrellas" aria-hidden="true">${'★'.repeat(llenas)}${'☆'.repeat(5 - llenas)}</span>${txt}`;
}
function imagenProducto(p, tam = 'normal') {
  return `<div class="ilustracion ilustracion--${tam}" style="--c1:${p.c1};--c2:${p.c2}" role="img" aria-label="Imagen ilustrativa de ${escapar(p.nombre)}"><span aria-hidden="true">${p.icono}</span></div>`;
}
function tarjetaProducto(p) {
  const prom = Catalogo.promedio(p.id_producto), n = Catalogo.resenas(p.id_producto).length;
  const marca = p.id_marca ? Catalogo.marca(p.id_marca).nombre : 'Genérico';
  const art = document.createElement('article');
  art.className = 'tarjeta-producto';
  art.innerHTML = `
    <a class="tarjeta-producto__img" href="producto.html?id=${p.id_producto}" tabindex="-1" aria-hidden="true">${imagenProducto(p)}</a>
    ${p.stock === 0 ? '<span class="insignia insignia--agotado">Agotado</span>' : p.stock <= 5 ? '<span class="insignia insignia--pocas">¡Últimas unidades!</span>' : ''}
    <div class="tarjeta-producto__cuerpo">
      <p class="tarjeta-producto__marca">${escapar(marca)}</p>
      <h3 class="tarjeta-producto__titulo"><a href="producto.html?id=${p.id_producto}">${escapar(p.nombre)}</a></h3>
      <p class="tarjeta-producto__resena">${n ? estrellas(prom) + ` <small>(${n})</small>` : '<small>Sin reseñas aún</small>'}</p>
      <p class="precio">${formatoCOP(p.precio)}</p>
      <button type="button" class="btn btn--primario btn--bloque" ${p.stock === 0 ? 'disabled' : ''}>
        ${p.stock === 0 ? 'Sin existencias' : 'Agregar al carrito'}<span class="solo-lectores">: ${escapar(p.nombre)}</span>
      </button>
    </div>`;
  const btn = $('button', art);
  if (p.stock > 0) btn.addEventListener('click', () => Carrito.agregar(p.id_producto));
  return art;
}

/* Avisos emergentes accesibles (región aria-live del pie de cada página) */
function aviso(mensaje, tipo = 'info') {
  const zona = $('#avisos'); if (!zona) return;
  const el = document.createElement('div');
  el.className = `aviso aviso--${tipo}`; el.textContent = mensaje;
  zona.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => { el.classList.remove('visible'); setTimeout(() => el.remove(), 300); }, 3500);
}

/* Ventana de confirmación accesible basada en <dialog> */
function confirmar(titulo, texto, textoBoton = 'Confirmar') {
  return new Promise(resolver => {
    const d = document.createElement('dialog');
    d.className = 'dialogo'; d.setAttribute('aria-labelledby', 'dlg-t');
    d.innerHTML = `<h2 id="dlg-t">${escapar(titulo)}</h2><p>${escapar(texto)}</p>
      <div class="acciones"><button class="btn btn--secundario" value="no">Volver</button><button class="btn btn--peligro" value="si">${escapar(textoBoton)}</button></div>`;
    document.body.appendChild(d);
    $$('button', d).forEach(b => b.addEventListener('click', () => { d.close(); resolver(b.value === 'si'); d.remove(); }));
    d.addEventListener('cancel', () => { resolver(false); d.remove(); });
    d.showModal(); $('button', d).focus();
  });
}

function actualizarContador() {
  const n = Carrito.cantidadTotal();
  $$('.contador-carrito').forEach(el => { el.textContent = n; el.hidden = n === 0; });
  const lbl = $('#enlace-carrito'); if (lbl) lbl.setAttribute('aria-label', `Carrito de compras, ${n} producto${n === 1 ? '' : 's'}`);
}
/* Muestra "Hola, nombre" o el enlace de ingreso en la cabecera */
function pintarCuenta() {
  const zona = $('#cuenta'); if (!zona) return;
  const u = Sesion.usuario();
  if (u) {
    zona.innerHTML = `<span class="saludo">Hola, <strong>${escapar(u.nombre)}</strong></span> <button type="button" class="btn-texto" id="salir">Salir</button>`;
    $('#salir').addEventListener('click', () => { Sesion.cerrar(); aviso('Cerraste sesión.'); pintarCuenta(); });
  } else zona.innerHTML = '<a href="login.html" class="btn btn--contorno btn--pequeno">Ingresar</a>';
}

/* ---------- Validación de formularios ----------
   reglas: { nombreCampo: valor => 'mensaje de error' | '' }
   Muestra el error junto al campo y marca aria-invalid. */
/* Devuelve el elemento que representa al campo (para grupos de radio, su fieldset) */
function nodoCampo(form, nombre) {
  const c = form.elements[nombre];
  return c instanceof RadioNodeList ? c[0].closest('fieldset') : c;
}
function validarCampo(form, nombre, regla) {
  const campo = form.elements[nombre];
  const esGrupo = campo instanceof RadioNodeList;
  const valor = esGrupo ? campo.value : campo.type === 'checkbox' ? campo.checked : campo.value.trim();
  const msg = regla(valor, form);
  const nodo = nodoCampo(form, nombre);
  const error = $(`#error-${nombre}`, form);
  if (error) error.textContent = msg;
  nodo.setAttribute('aria-invalid', msg ? 'true' : 'false');
  const cont = nodo.closest('.campo') || nodo;
  cont.classList.toggle('campo--error', !!msg);
  cont.classList.toggle('campo--ok', !msg && !esGrupo && campo.type !== 'checkbox' && campo.value !== '');
  return !msg;
}
function activarValidacion(form, reglas) {
  Object.entries(reglas).forEach(([n, r]) => {
    const c = form.elements[n];
    const nodos = c instanceof RadioNodeList ? [...c] : [c];
    nodos.forEach(el => {
      el.addEventListener(el.type === 'radio' || el.type === 'checkbox' ? 'change' : 'blur', () => validarCampo(form, n, r));
      el.addEventListener('input', () => { if (nodoCampo(form, n).getAttribute('aria-invalid') === 'true') validarCampo(form, n, r); });
    });
  });
  return () => {
    const malos = Object.entries(reglas).filter(([n, r]) => !validarCampo(form, n, r));
    if (malos.length) { const f = form.elements[malos[0][0]]; (f instanceof RadioNodeList ? f[0] : f).focus(); aviso(`Revisa ${malos.length} campo${malos.length > 1 ? 's' : ''} con error.`, 'error'); }
    return malos.length === 0;
  };
}
const Reglas = {
  requerido: mensaje => v => v ? '' : mensaje,
  correo: v => !v ? 'El correo es obligatorio.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Escribe un correo válido, por ejemplo nombre@correo.com.',
  telefono: v => !v || /^3\d{9}$|^\d{7,10}$/.test(v) ? '' : 'Escribe un número de 7 a 10 dígitos (celular de 10 dígitos que inicia en 3).',
  soloLetras: nombre => v => !v ? `${nombre} es obligatorio.` : /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{2,50}$/.test(v) ? '' : `${nombre} solo admite letras (2 a 50).`,
  contrasena: v => !v ? 'La contraseña es obligatoria.' : v.length < 8 ? 'Debe tener al menos 8 caracteres.' : !/[A-Z]/.test(v) || !/\d/.test(v) ? 'Debe incluir una mayúscula y un número.' : ''
};

/* ---------- Inicio común ---------- */
document.addEventListener('DOMContentLoaded', () => {
  asegurarUsuarioDemo();
  actualizarContador();
  pintarCuenta();
  /* Menú móvil */
  const btn = $('#btn-menu'), menu = $('#menu-principal');
  btn?.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    btn.setAttribute('aria-expanded', abierto);
  });
  /* Año del pie de página */
  $$('.anio').forEach(e => e.textContent = new Date().getFullYear());
});
