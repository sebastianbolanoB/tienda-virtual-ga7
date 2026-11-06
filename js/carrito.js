/* carrito.js · Lista del carrito, cambio de cantidades y resumen del pedido */
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const lista = $('#items-carrito');

  function pintar() {
    const items = Carrito.items();
    $('#carrito-vacio').hidden = items.length > 0;
    $('#carrito-lleno').hidden = items.length === 0;
    lista.innerHTML = '';
    items.forEach(it => {
      const p = Catalogo.producto(it.id_producto);
      const li = document.createElement('li');
      li.className = 'item-carrito';
      li.innerHTML = `
        <a href="producto.html?id=${p.id_producto}" class="item-carrito__img" tabindex="-1" aria-hidden="true">${imagenProducto(p, 'mini')}</a>
        <div class="item-carrito__info">
          <h2><a href="producto.html?id=${p.id_producto}">${escapar(p.nombre)}</a></h2>
          <p class="texto-suave">SKU ${p.sku} · ${formatoCOP(p.precio)} c/u</p>
        </div>
        <div class="cantidad cantidad--pequena" role="group" aria-label="Cantidad de ${escapar(p.nombre)}">
          <button type="button" class="cantidad__btn" data-paso="-1" aria-label="Disminuir">−</button>
          <input type="number" value="${it.cantidad}" min="1" max="${p.stock}" inputmode="numeric" aria-label="Cantidad">
          <button type="button" class="cantidad__btn" data-paso="1" aria-label="Aumentar">+</button>
        </div>
        <p class="item-carrito__subtotal">${formatoCOP(p.precio * it.cantidad)}</p>
        <button type="button" class="btn-icono" aria-label="Quitar ${escapar(p.nombre)} del carrito" title="Quitar">✕</button>`;
      const inp = $('input', li);
      const fijar = v => {
        if (isNaN(v) || v < 1) v = 1;
        if (v > p.stock) { v = p.stock; aviso(`Solo hay ${p.stock} unidades disponibles.`, 'error'); }
        Carrito.cambiar(p.id_producto, v); pintar();
      };
      $$('.cantidad__btn', li).forEach(b => b.addEventListener('click', () => fijar(it.cantidad + Number(b.dataset.paso))));
      inp.addEventListener('change', () => fijar(parseInt(inp.value, 10)));
      $('.btn-icono', li).addEventListener('click', () => { Carrito.quitar(p.id_producto); aviso(`${p.nombre} se quitó del carrito.`); pintar(); });
      lista.appendChild(li);
    });
    const r = Carrito.resumen();
    $('#r-subtotal').textContent = formatoCOP(r.subtotal);
    $('#r-envio').textContent = r.envio === 0 ? 'Gratis' : formatoCOP(r.envio);
    $('#r-total').textContent = formatoCOP(r.total);
    const falta = ENVIO.gratisDesde - r.subtotal;
    $('#barra-envio').value = Math.min(r.subtotal, ENVIO.gratisDesde);
    $('#msg-envio').innerHTML = falta > 0 ? `Te faltan <strong>${formatoCOP(falta)}</strong> para el envío gratis.` : '<strong>¡Tu envío es gratis!</strong>';
  }

  $('#barra-envio').max = ENVIO.gratisDesde;
  $('#vaciar').addEventListener('click', async () => {
    if (await confirmar('¿Vaciar el carrito?', 'Se quitarán todos los productos del carrito.', 'Vaciar')) { Carrito.vaciar(); pintar(); aviso('El carrito quedó vacío.'); }
  });
  pintar();
});
