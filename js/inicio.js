/* inicio.js · Página principal: categorías, destacados y boletín */
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  /* Categorías principales (las que no tienen padre) */
  const lista = $('#lista-categorias');
  CATEGORIAS.filter(c => c.id_categoria_padre === null).forEach(c => {
    const total = PRODUCTOS.filter(p => Catalogo.idsConHijas(c.id_categoria).includes(p.id_categoria)).length;
    const li = document.createElement('li');
    li.innerHTML = `<a class="tarjeta-categoria" href="catalogo.html?categoria=${c.id_categoria}">
        <span class="tarjeta-categoria__icono" aria-hidden="true">${c.icono}</span>
        <span class="tarjeta-categoria__nombre">${escapar(c.nombre)}</span>
        <span class="tarjeta-categoria__desc">${escapar(c.descripcion)}</span>
        <span class="tarjeta-categoria__total">${total} productos</span></a>`;
    lista.appendChild(li);
  });

  /* Productos destacados */
  const grilla = $('#destacados');
  PRODUCTOS.filter(p => p.destacado).forEach(p => grilla.appendChild(tarjetaProducto(p)));

  /* Formulario del boletín */
  const form = $('#form-boletin');
  const validar = activarValidacion(form, { correo_boletin: Reglas.correo });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validar()) return;
    aviso('¡Listo! Te enviaremos nuestras ofertas.', 'ok');
    form.reset(); form.elements.correo_boletin.closest('.campo').classList.remove('campo--ok');
  });
});
