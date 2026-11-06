/* pedidos.js · Historial de pedidos del usuario con seguimiento de estado */
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  if (!Sesion.exigir()) return;
  const u = Sesion.usuario(), zona = $('#lista-pedidos');
  const ETAPAS = ['Pendiente', 'Pagado', 'Enviado', 'Entregado'];
  const nuevo = Number(parametro('nuevo'));
  if (nuevo) aviso(`¡Pedido N.º ${nuevo} registrado con éxito!`, 'ok');

  function pintar() {
    const pedidos = Almacen.leer('pedidos', []).filter(p => p.id_usuario === u.id_usuario).reverse();
    $('#sin-pedidos').hidden = pedidos.length > 0;
    zona.innerHTML = '';
    pedidos.forEach(p => {
      const ciudad = CIUDADES.find(c => c.id_ciudad === p.direccion.id_ciudad);
      const metodo = METODOS_PAGO.find(m => m.id_metodo_pago === p.pago.id_metodo_pago);
      const idx = ETAPAS.indexOf(p.estado);
      const fecha = new Date(p.fecha_pedido).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
      const art = document.createElement('article');
      art.className = 'pedido' + (p.id_pedido === nuevo ? ' pedido--nuevo' : '');
      art.setAttribute('aria-labelledby', `ped-${p.id_pedido}`);
      art.innerHTML = `
        <header class="pedido__cab">
          <div><h2 id="ped-${p.id_pedido}">Pedido N.º ${p.id_pedido}</h2><p class="texto-suave">${fecha}</p></div>
          <span class="estado estado--${p.estado.toLowerCase()}">${p.estado}</span>
        </header>
        ${p.estado === 'Cancelado' ? '<p class="nota">Este pedido fue cancelado.</p>' : `
        <ol class="seguimiento" aria-label="Seguimiento del pedido">
          ${ETAPAS.map((e, i) => `<li class="${i < idx ? 'hecho' : i === idx ? 'actual' : ''}"${i === idx ? ' aria-current="step"' : ''}><span class="seguimiento__punto" aria-hidden="true">${i < idx ? '✓' : i + 1}</span>${e}</li>`).join('')}
        </ol>`}
        <details>
          <summary>Ver detalle del pedido</summary>
          <div class="tabla-desplazable"><table class="tabla">
            <caption class="solo-lectores">Productos del pedido ${p.id_pedido}</caption>
            <thead><tr><th scope="col">Producto</th><th scope="col">Cant.</th><th scope="col">Precio unitario</th><th scope="col">Subtotal</th></tr></thead>
            <tbody>${p.detalle.map(d => `<tr><td>${escapar(Catalogo.producto(d.id_producto).nombre)}</td><td>${d.cantidad}</td><td>${formatoCOP(d.precio_unitario)}</td><td>${formatoCOP(d.cantidad * d.precio_unitario)}</td></tr>`).join('')}</tbody>
            <tfoot><tr><th scope="row" colspan="3">Envío</th><td>${p.costo_envio ? formatoCOP(p.costo_envio) : 'Gratis'}</td></tr><tr><th scope="row" colspan="3">Total</th><td><strong>${formatoCOP(p.total)}</strong></td></tr></tfoot>
          </table></div>
          <dl class="lista-datos">
            <dt>Entrega</dt><dd>${escapar(p.direccion.destinatario)} · ${escapar(p.direccion.direccion)}, ${escapar(ciudad.nombre)}</dd>
            <dt>Pago</dt><dd>${metodo.icono} ${escapar(metodo.nombre)} · ${p.pago.estado} · Ref. ${p.pago.referencia}</dd>
          </dl>
        </details>
        ${p.estado === 'Pendiente' || p.estado === 'Pagado' ? '<button type="button" class="btn btn--contorno-peligro btn--pequeno" data-cancelar>Cancelar pedido</button>' : ''}`;
      $('[data-cancelar]', art)?.addEventListener('click', async () => {
        if (!await confirmar(`¿Cancelar el pedido N.º ${p.id_pedido}?`, 'Esta acción no se puede deshacer.', 'Sí, cancelar')) return;
        const todos = Almacen.leer('pedidos', []); const x = todos.find(t => t.id_pedido === p.id_pedido);
        x.estado = 'Cancelado'; x.pago.estado = 'Rechazado'; Almacen.guardar('pedidos', todos);
        aviso(`El pedido N.º ${p.id_pedido} fue cancelado.`); pintar();
      });
      zona.appendChild(art);
    });
  }
  pintar();
});
