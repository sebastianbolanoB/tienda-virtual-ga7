/* catalogo.js · Búsqueda, filtros, orden y paginación del catálogo.
   El estado de los filtros se refleja en la URL para poder compartir el enlace. */
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const form = $('#filtros'), grilla = $('#productos'), info = $('#resultado-info'), paginacion = $('#paginacion');
  const POR_PAGINA = 6;
  let pagina = 1;

  /* Llenar los controles a partir de los datos */
  const zonaCat = $('#filtro-categorias');
  CATEGORIAS.filter(c => !c.id_categoria_padre).forEach(c => {
    const hijas = CATEGORIAS.filter(h => h.id_categoria_padre === c.id_categoria);
    zonaCat.insertAdjacentHTML('beforeend', `<label class="opcion"><input type="radio" name="categoria" value="${c.id_categoria}"> ${escapar(c.nombre)}</label>`
      + hijas.map(h => `<label class="opcion opcion--hija"><input type="radio" name="categoria" value="${h.id_categoria}"> ${escapar(h.nombre)}</label>`).join(''));
  });
  MARCAS.forEach(m => form.elements.marca.insertAdjacentHTML('beforeend', `<option value="${m.id_marca}">${escapar(m.nombre)}</option>`));
  const maxPrecio = Math.max(...PRODUCTOS.map(p => p.precio));
  form.elements.precio.max = Math.ceil(maxPrecio / 10000) * 10000;

  /* Leer el estado inicial desde la URL */
  const url = new URLSearchParams(location.search);
  form.elements.q.value = url.get('q') || '';
  const radio = $(`input[name="categoria"][value="${url.get('categoria') || '0'}"]`, form); if (radio) radio.checked = true;
  form.elements.marca.value = url.get('marca') || '0';
  form.elements.precio.value = url.get('precio') || form.elements.precio.max;
  form.elements.orden.value = url.get('orden') || 'relevancia';
  form.elements.disponibles.checked = url.get('disponibles') === '1';

  function filtrar() {
    const f = form.elements;
    const q = f.q.value.trim().toLowerCase();
    const cat = Number(form.querySelector('input[name="categoria"]:checked')?.value || 0);
    const ids = cat ? Catalogo.idsConHijas(cat) : null;
    let lista = PRODUCTOS.filter(p =>
      (!q || p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q)) &&
      (!ids || ids.includes(p.id_categoria)) &&
      (f.marca.value === '0' || p.id_marca === Number(f.marca.value)) &&
      p.precio <= Number(f.precio.value) &&
      (!f.disponibles.checked || p.stock > 0));
    const orden = {
      'precio-asc': (a, b) => a.precio - b.precio, 'precio-desc': (a, b) => b.precio - a.precio,
      'nombre': (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
      'calificacion': (a, b) => Catalogo.promedio(b.id_producto) - Catalogo.promedio(a.id_producto),
      'relevancia': (a, b) => (b.destacado - a.destacado) || (b.stock > 0) - (a.stock > 0)
    };
    return lista.sort(orden[f.orden.value]);
  }

  function pintar() {
    const lista = filtrar();
    const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    pagina = Math.min(pagina, paginas);
    grilla.innerHTML = '';
    lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).forEach(p => grilla.appendChild(tarjetaProducto(p)));
    $('#precio-valor').textContent = formatoCOP(Number(form.elements.precio.value));
    info.textContent = lista.length ? `${lista.length} producto${lista.length > 1 ? 's' : ''} encontrado${lista.length > 1 ? 's' : ''}` : '';
    $('#sin-resultados').hidden = lista.length > 0;
    /* Paginación */
    paginacion.innerHTML = '';
    if (paginas > 1) for (let i = 1; i <= paginas; i++) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pagina' + (i === pagina ? ' activa' : ''); b.textContent = i;
      b.setAttribute('aria-label', `Página ${i}`); if (i === pagina) b.setAttribute('aria-current', 'page');
      b.addEventListener('click', () => { pagina = i; pintar(); grilla.scrollIntoView({ behavior: 'smooth' }); });
      paginacion.appendChild(b);
    }
    /* Sincronizar la URL sin recargar */
    const f = form.elements, p = new URLSearchParams();
    if (f.q.value.trim()) p.set('q', f.q.value.trim());
    const cat = form.querySelector('input[name="categoria"]:checked')?.value; if (cat && cat !== '0') p.set('categoria', cat);
    if (f.marca.value !== '0') p.set('marca', f.marca.value);
    if (f.precio.value !== f.precio.max) p.set('precio', f.precio.value);
    if (f.orden.value !== 'relevancia') p.set('orden', f.orden.value);
    if (f.disponibles.checked) p.set('disponibles', '1');
    history.replaceState(null, '', '?' + p.toString());
  }

  form.addEventListener('input', () => { pagina = 1; pintar(); });
  form.addEventListener('submit', e => e.preventDefault());
  $('#limpiar-filtros').addEventListener('click', () => {
    form.reset(); $('input[name="categoria"][value="0"]', form).checked = true; form.elements.precio.value = form.elements.precio.max; pagina = 1; pintar();
  });
  /* Botón para mostrar los filtros en celulares */
  const btnF = $('#btn-filtros');
  btnF.addEventListener('click', () => { const ab = form.classList.toggle('abierto'); btnF.setAttribute('aria-expanded', ab); });
  pintar();
});
