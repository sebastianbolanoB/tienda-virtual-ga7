/* checkout.js · Proceso de compra en tres pasos: entrega, pago y confirmación.
   Al confirmar se crea un pedido con su detalle, pago y envío, igual que en la BD. */
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  if (!Sesion.exigir()) return;
  if (Carrito.items().length === 0) { location.href = 'carrito.html'; return; }
  const u = Sesion.usuario();
  const form = $('#form-checkout');
  const pasos = $$('.paso', form), indicadores = $$('.pasos-indicador li');
  let actual = 0;

  /* Datos del formulario */
  CIUDADES.forEach(c => form.elements.ciudad.insertAdjacentHTML('beforeend', `<option value="${c.id_ciudad}">${escapar(c.nombre)} (${escapar(c.departamento)})</option>`));
  $('#metodos').innerHTML = METODOS_PAGO.map(m => `<label class="opcion-pago"><input type="radio" name="metodo" value="${m.id_metodo_pago}"><span aria-hidden="true">${m.icono}</span> ${escapar(m.nombre)}</label>`).join('');
  form.elements.destinatario.value = `${u.nombre} ${u.apellido}`;

  /* Reglas por paso */
  const reglasPaso = [
    { destinatario: Reglas.soloLetras('El nombre de quien recibe'), ciudad: v => v ? '' : 'Selecciona la ciudad.',
      direccion: v => v.length < 8 ? 'Escribe la dirección completa (calle, número y complemento).' : '', telefono_entrega: v => v ? Reglas.telefono(v) : 'El teléfono de contacto es obligatorio.' },
    { metodo: v => v ? '' : 'Selecciona un método de pago.' }
  ];
  const validadores = reglasPaso.map(r => activarValidacion(form, r));

  /* Resumen lateral */
  function pintarResumen() {
    const r = Carrito.resumen();
    $('#resumen-items').innerHTML = Carrito.items().map(i => { const p = Catalogo.producto(i.id_producto);
      return `<li><span>${i.cantidad} × ${escapar(p.nombre)}</span><span>${formatoCOP(p.precio * i.cantidad)}</span></li>`; }).join('');
    $('#c-subtotal').textContent = formatoCOP(r.subtotal);
    $('#c-envio').textContent = r.envio ? formatoCOP(r.envio) : 'Gratis';
    $('#c-total').textContent = formatoCOP(r.total);
  }
  /* Cambiar de paso, moviendo el foco al título del paso para lectores de pantalla */
  function irA(n) {
    actual = n;
    pasos.forEach((p, i) => p.hidden = i !== n);
    indicadores.forEach((li, i) => { li.classList.toggle('activo', i === n); li.classList.toggle('hecho', i < n); if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    const h = $('h2', pasos[n]); h.setAttribute('tabindex', '-1'); h.focus();
    if (n === 2) pintarConfirmacion();
  }
  function pintarConfirmacion() {
    const f = form.elements, c = CIUDADES.find(x => x.id_ciudad === Number(f.ciudad.value)), m = METODOS_PAGO.find(x => x.id_metodo_pago === Number(f.metodo.value));
    $('#confirmacion').innerHTML = `<dl class="lista-datos">
      <dt>Recibe</dt><dd>${escapar(f.destinatario.value)} · ${escapar(f.telefono_entrega.value)}</dd>
      <dt>Dirección</dt><dd>${escapar(f.direccion.value)}${f.barrio.value ? ', ' + escapar(f.barrio.value) : ''} · ${escapar(c.nombre)}</dd>
      <dt>Pago</dt><dd>${m.icono} ${escapar(m.nombre)}</dd></dl>`;
  }
  $$('[data-siguiente]', form).forEach(b => b.addEventListener('click', () => { if (validadores[actual]()) irA(actual + 1); }));
  $$('[data-anterior]', form).forEach(b => b.addEventListener('click', () => irA(actual - 1)));

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.elements.acepto.checked) { $('#error-acepto').textContent = 'Debes aceptar los términos para continuar.'; form.elements.acepto.focus(); return; }
    const f = form.elements, r = Carrito.resumen(), pedidos = Almacen.leer('pedidos', []);
    const metodo = Number(f.metodo.value), ahora = new Date().toISOString();
    const pedido = {
      id_pedido: (pedidos.at(-1)?.id_pedido || 1000) + 1, id_usuario: u.id_usuario, fecha_pedido: ahora,
      estado: metodo === 4 ? 'Pendiente' : 'Pagado', subtotal: r.subtotal, costo_envio: r.envio, total: r.total,
      direccion: { destinatario: f.destinatario.value.trim(), id_ciudad: Number(f.ciudad.value), direccion: f.direccion.value.trim(), barrio: f.barrio.value.trim(), telefono: f.telefono_entrega.value },
      detalle: Carrito.items().map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad, precio_unitario: Catalogo.producto(i.id_producto).precio })),
      pago: { id_metodo_pago: metodo, monto: r.total, estado: metodo === 4 ? 'Pendiente' : 'Aprobado', referencia: 'TV-' + Date.now().toString().slice(-8) },
      envio: { transportadora: 'Servientrega', estado: 'Preparando' }
    };
    pedidos.push(pedido); Almacen.guardar('pedidos', pedidos); Carrito.vaciar();
    location.href = `pedidos.html?nuevo=${pedido.id_pedido}`;
  });
  form.elements.acepto.addEventListener('change', () => $('#error-acepto').textContent = '');
  pintarResumen(); irA(0); window.scrollTo(0, 0);
});
