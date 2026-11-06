/* producto.js · Detalle del producto, selector de cantidad y reseñas */
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const p = Catalogo.producto(parametro('id'));
  const zona = $('#detalle');
  if (!p) {
    zona.innerHTML = '<div class="vacio"><p>El producto que buscas no existe.</p><a class="btn btn--primario" href="catalogo.html">Volver al catálogo</a></div>';
    return;
  }
  const cat = Catalogo.categoria(p.id_categoria), padre = cat.id_categoria_padre ? Catalogo.categoria(cat.id_categoria_padre) : null;
  const marca = p.id_marca ? Catalogo.marca(p.id_marca).nombre : 'Genérico';
  document.title = `${p.nombre} | TiendaVirtual`;

  /* Migas de pan */
  $('#migas').innerHTML = `<li><a href="index.html">Inicio</a></li><li><a href="catalogo.html">Catálogo</a></li>`
    + (padre ? `<li><a href="catalogo.html?categoria=${padre.id_categoria}">${escapar(padre.nombre)}</a></li>` : '')
    + `<li><a href="catalogo.html?categoria=${cat.id_categoria}">${escapar(cat.nombre)}</a></li><li aria-current="page">${escapar(p.nombre)}</li>`;

  function pintarDetalle() {
    const resenas = Catalogo.resenas(p.id_producto), prom = Catalogo.promedio(p.id_producto);
    const estado = p.stock === 0 ? '<span class="estado estado--agotado">Agotado</span>' : p.stock <= 5 ? `<span class="estado estado--pocas">Quedan ${p.stock} unidades</span>` : '<span class="estado estado--ok">Disponible</span>';
    zona.innerHTML = `
      <div class="detalle__imagen">${imagenProducto(p, 'grande')}</div>
      <div class="detalle__info">
        <p class="detalle__marca">${escapar(marca)} · SKU ${p.sku}</p>
        <h1>${escapar(p.nombre)}</h1>
        <p class="detalle__resena">${resenas.length ? `${estrellas(prom)} <a href="#resenas">${prom.toFixed(1)} · ${resenas.length} reseña${resenas.length > 1 ? 's' : ''}</a>` : '<a href="#resenas">Sé el primero en opinar</a>'}</p>
        <p class="precio precio--grande">${formatoCOP(p.precio)}</p>
        ${estado}
        <p class="detalle__desc">${escapar(p.descripcion)}</p>
        <form id="form-compra" class="compra" novalidate>
          <div class="cantidad" role="group" aria-labelledby="lbl-cant">
            <span id="lbl-cant" class="cantidad__lbl">Cantidad</span>
            <button type="button" class="cantidad__btn" data-paso="-1" aria-label="Disminuir cantidad">−</button>
            <input type="number" id="cantidad" name="cantidad" value="1" min="1" max="${Math.max(1, p.stock)}" inputmode="numeric" aria-label="Cantidad" ${p.stock === 0 ? 'disabled' : ''}>
            <button type="button" class="cantidad__btn" data-paso="1" aria-label="Aumentar cantidad">+</button>
          </div>
          <button type="submit" class="btn btn--primario btn--grande" ${p.stock === 0 ? 'disabled' : ''}>${p.stock === 0 ? 'Sin existencias' : 'Agregar al carrito'}</button>
        </form>
        <ul class="beneficios-mini">
          <li><span aria-hidden="true">🚚</span> Envío gratis desde ${formatoCOP(ENVIO.gratisDesde)}</li>
          <li><span aria-hidden="true">🔒</span> Pago seguro</li>
          <li><span aria-hidden="true">↩️</span> 30 días para devoluciones</li>
        </ul>
      </div>`;
    /* Selector de cantidad */
    const inp = $('#cantidad');
    $$('.cantidad__btn').forEach(b => b.addEventListener('click', () => {
      const v = Math.min(Math.max(1, Number(inp.value) + Number(b.dataset.paso)), Math.max(1, p.stock)); inp.value = v;
    }));
    $('#form-compra').addEventListener('submit', e => {
      e.preventDefault();
      const n = parseInt(inp.value, 10);
      if (isNaN(n) || n < 1) { aviso('La cantidad debe ser al menos 1.', 'error'); inp.focus(); return; }
      Carrito.agregar(p.id_producto, n);
    });
  }

  /* Ficha técnica */
  $('#ficha').innerHTML = Object.entries(p.specs).map(([k, v]) => `<tr><th scope="row">${escapar(k)}</th><td>${escapar(v)}</td></tr>`).join('')
    + `<tr><th scope="row">Categoría</th><td>${escapar(cat.nombre)}</td></tr><tr><th scope="row">Marca</th><td>${escapar(marca)}</td></tr>`;

  /* Reseñas */
  function pintarResenas() {
    const r = Catalogo.resenas(p.id_producto).sort((a, b) => b.fecha.localeCompare(a.fecha));
    $('#lista-resenas').innerHTML = r.length ? r.map(x => `<li class="resena">
        <div class="resena__cab">${estrellas(x.calificacion)} <strong>${escapar(x.autor)}</strong> <time datetime="${x.fecha}">${new Date(x.fecha + 'T12:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</time></div>
        <p>${escapar(x.comentario)}</p></li>`).join('') : '<li class="vacio-lista">Este producto aún no tiene reseñas.</li>';
  }
  const formR = $('#form-resena'), u = Sesion.usuario();
  if (!u) {
    formR.innerHTML = `<p>Para calificar este producto debes <a href="login.html?volver=${encodeURIComponent('producto.html?id=' + p.id_producto)}">iniciar sesión</a>.</p>`;
  } else {
    const validar = activarValidacion(formR, {
      calificacion: () => formR.querySelector('input[name="calificacion"]:checked') ? '' : 'Selecciona de 1 a 5 estrellas.',
      comentario: v => v.length < 10 ? 'Escribe al menos 10 caracteres.' : v.length > 500 ? 'Máximo 500 caracteres.' : ''
    });
    formR.elements.comentario.addEventListener('input', e => $('#contador-com').textContent = `${e.target.value.length}/500`);
    formR.addEventListener('submit', e => {
      e.preventDefault();
      if (!validar()) return;
      const propias = Almacen.leer('resenas', []);
      if (propias.some(x => x.id_producto === p.id_producto && x.id_usuario === u.id_usuario)) { aviso('Ya calificaste este producto (solo se permite una reseña por cliente).', 'error'); return; }
      propias.push({ id_producto: p.id_producto, id_usuario: u.id_usuario, autor: `${u.nombre} ${u.apellido.charAt(0)}.`, calificacion: Number(formR.querySelector('input[name="calificacion"]:checked').value),
        comentario: formR.elements.comentario.value.trim(), fecha: new Date().toISOString().slice(0, 10) });
      Almacen.guardar('resenas', propias);
      formR.reset(); $('#contador-com').textContent = '0/500';
      aviso('¡Gracias! Tu reseña fue publicada.', 'ok'); pintarResenas(); pintarDetalle();
    });
  }

  /* Productos relacionados de la misma categoría principal */
  const raiz = padre ? padre.id_categoria : cat.id_categoria;
  const rel = PRODUCTOS.filter(x => x.id_producto !== p.id_producto && Catalogo.idsConHijas(raiz).includes(x.id_categoria)).slice(0, 3);
  rel.forEach(x => $('#relacionados').appendChild(tarjetaProducto(x)));
  $('#sec-relacionados').hidden = rel.length === 0;

  pintarDetalle(); pintarResenas();
});
