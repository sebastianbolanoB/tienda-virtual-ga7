/* ============================================================
   datos.js · Datos de ejemplo de TiendaVirtual
   Reflejan las tablas de la base de datos tienda_virtual
   (categoria, marca, producto, ciudad, metodo_pago, resena).
   En la versión final estos datos llegarían desde la API.
   ============================================================ */
'use strict';

const CATEGORIAS = [
  { id_categoria: 1, id_categoria_padre: null, nombre: 'Tecnología', icono: '💻', descripcion: 'Computadores, accesorios y dispositivos' },
  { id_categoria: 2, id_categoria_padre: 1, nombre: 'Audio', icono: '🎧', descripcion: 'Audífonos, parlantes y micrófonos' },
  { id_categoria: 3, id_categoria_padre: 1, nombre: 'Periféricos', icono: '⌨️', descripcion: 'Teclados, mouse y cámaras web' },
  { id_categoria: 4, id_categoria_padre: null, nombre: 'Hogar y oficina', icono: '🏠', descripcion: 'Artículos para el hogar y el puesto de trabajo' },
  { id_categoria: 5, id_categoria_padre: null, nombre: 'Deportes', icono: '⚽', descripcion: 'Implementos para entrenar y jugar' }
];

const MARCAS = [
  { id_marca: 1, nombre: 'Sonik' }, { id_marca: 2, nombre: 'KeyPro' },
  { id_marca: 3, nombre: 'Lumen' }, { id_marca: 4, nombre: 'Andes Sport' }
];

/* color1/color2: degradado de la ilustración del producto */
const PRODUCTOS = [
  { id_producto: 1, id_categoria: 2, id_marca: 1, sku: 'AUD-001', nombre: 'Audífonos inalámbricos Sonik Air', precio: 89900, stock: 25, icono: '🎧', c1: '#dbeafe', c2: '#93c5fd', destacado: true,
    descripcion: 'Audífonos Bluetooth 5.3 con cancelación pasiva de ruido, micrófono integrado y hasta 20 horas de batería. Ideales para clases virtuales y para programar sin distracciones.',
    specs: { 'Conexión': 'Bluetooth 5.3', 'Batería': '20 horas', 'Peso': '180 g', 'Garantía': '12 meses' } },
  { id_producto: 2, id_categoria: 2, id_marca: 1, sku: 'AUD-002', nombre: 'Parlante portátil Sonik Go', precio: 119900, stock: 12, icono: '🔊', c1: '#ede9fe', c2: '#c4b5fd', destacado: false,
    descripcion: 'Parlante resistente al agua (IPX6) de 10 W con sonido envolvente y correa para llevarlo a cualquier lugar.',
    specs: { 'Potencia': '10 W', 'Resistencia': 'IPX6', 'Batería': '12 horas', 'Garantía': '12 meses' } },
  { id_producto: 3, id_categoria: 3, id_marca: 2, sku: 'PER-001', nombre: 'Teclado mecánico KeyPro K87', precio: 149900, stock: 8, icono: '⌨️', c1: '#dcfce7', c2: '#86efac', destacado: true,
    descripcion: 'Teclado mecánico compacto con switches azules, iluminación LED y teclas de doble inyección. Distribución en español.',
    specs: { 'Switches': 'Azules (táctiles)', 'Formato': 'TKL 87 teclas', 'Conexión': 'USB-C', 'Garantía': '24 meses' } },
  { id_producto: 4, id_categoria: 3, id_marca: 2, sku: 'PER-002', nombre: 'Mouse ergonómico vertical', precio: 59900, stock: 30, icono: '🖱️', c1: '#fef3c7', c2: '#fcd34d', destacado: true,
    descripcion: 'Mouse vertical inalámbrico que mantiene la muñeca en posición natural y reduce la tensión en jornadas largas frente al computador.',
    specs: { 'Sensor': '1600 DPI', 'Conexión': '2,4 GHz', 'Botones': '6', 'Garantía': '12 meses' } },
  { id_producto: 5, id_categoria: 3, id_marca: 2, sku: 'PER-003', nombre: 'Cámara web Full HD', precio: 99900, stock: 4, icono: '📷', c1: '#fce7f3', c2: '#f9a8d4', destacado: false,
    descripcion: 'Cámara web 1080p con micrófono dual y corrección automática de luz. Perfecta para clases y entrevistas virtuales.',
    specs: { 'Resolución': '1080p a 30 fps', 'Micrófono': 'Dual', 'Montaje': 'Clip universal', 'Garantía': '12 meses' } },
  { id_producto: 6, id_categoria: 4, id_marca: 3, sku: 'HOG-001', nombre: 'Lámpara LED de escritorio', precio: 45900, stock: 20, icono: '💡', c1: '#fff7ed', c2: '#fdba74', destacado: false,
    descripcion: 'Lámpara con tres temperaturas de color, cinco niveles de brillo y brazo flexible para iluminar el puesto de estudio.',
    specs: { 'Potencia': '8 W', 'Niveles de brillo': '5', 'Alimentación': 'USB', 'Garantía': '6 meses' } },
  { id_producto: 7, id_categoria: 4, id_marca: 3, sku: 'HOG-002', nombre: 'Soporte para portátil', precio: 69900, stock: 15, icono: '💻', c1: '#e0f2fe', c2: '#7dd3fc', destacado: true,
    descripcion: 'Soporte de aluminio con seis alturas que eleva la pantalla al nivel de los ojos y mejora la postura.',
    specs: { 'Material': 'Aluminio', 'Alturas': '6 posiciones', 'Compatible': 'Portátiles de 10" a 17"', 'Garantía': '12 meses' } },
  { id_producto: 8, id_categoria: 5, id_marca: 4, sku: 'DEP-001', nombre: 'Balón de fútbol Andes Pro', precio: 59900, stock: 18, icono: '⚽', c1: '#dcfce7', c2: '#4ade80', destacado: false,
    descripcion: 'Balón número 5 de cuero sintético cosido a máquina, apto para cancha sintética y natural.',
    specs: { 'Tamaño': 'N.º 5', 'Material': 'Cuero sintético', 'Uso': 'Cancha natural y sintética', 'Garantía': '3 meses' } },
  { id_producto: 9, id_categoria: 5, id_marca: null, sku: 'DEP-002', nombre: 'Cuerda para saltar ajustable', precio: 19900, stock: 0, icono: '🪢', c1: '#f1f5f9', c2: '#cbd5e1', destacado: false,
    descripcion: 'Cuerda de velocidad con rodamientos y mangos antideslizantes. Longitud ajustable para cualquier estatura.',
    specs: { 'Longitud': 'Hasta 3 m', 'Mangos': 'Antideslizantes', 'Rodamientos': 'Sí', 'Garantía': '3 meses' } }
];

const CIUDADES = [
  { id_ciudad: 1, nombre: 'Bogotá D.C.', departamento: 'Cundinamarca' }, { id_ciudad: 2, nombre: 'Medellín', departamento: 'Antioquia' },
  { id_ciudad: 3, nombre: 'Cali', departamento: 'Valle del Cauca' }, { id_ciudad: 4, nombre: 'Barranquilla', departamento: 'Atlántico' },
  { id_ciudad: 5, nombre: 'Soacha', departamento: 'Cundinamarca' }
];

const METODOS_PAGO = [
  { id_metodo_pago: 1, nombre: 'Tarjeta de crédito', icono: '💳' }, { id_metodo_pago: 2, nombre: 'Tarjeta débito', icono: '🏦' },
  { id_metodo_pago: 3, nombre: 'PSE', icono: '🔐' }, { id_metodo_pago: 4, nombre: 'Contra entrega', icono: '📦' }
];

/* Reseñas iniciales (tabla resena) */
const RESENAS_BASE = [
  { id_producto: 1, autor: 'Andrés M.', calificacion: 5, comentario: 'Muy buen sonido y la batería dura bastante.', fecha: '2026-10-05' },
  { id_producto: 1, autor: 'Camila R.', calificacion: 4, comentario: 'Cómodos, aunque el estuche podría ser mejor.', fecha: '2026-10-18' },
  { id_producto: 3, autor: 'Camila R.', calificacion: 5, comentario: 'Excelente teclado para programar.', fecha: '2026-10-15' },
  { id_producto: 4, autor: 'Andrés M.', calificacion: 4, comentario: 'Se siente raro al inicio, pero alivia la muñeca.', fecha: '2026-10-07' },
  { id_producto: 7, autor: 'Laura G.', calificacion: 5, comentario: 'Mi cuello lo agradece. Muy firme.', fecha: '2026-10-22' }
];

const ENVIO = { costo: 8000, gratisDesde: 150000 };
