/* cuenta.js · Inicio de sesión y registro de usuarios con validación */
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  /* Botón para mostrar u ocultar la contraseña */
  $$('.ver-clave').forEach(b => b.addEventListener('click', () => {
    const inp = document.getElementById(b.getAttribute('aria-controls'));
    const visible = inp.type === 'text';
    inp.type = visible ? 'password' : 'text';
    b.setAttribute('aria-pressed', String(!visible)); b.textContent = visible ? 'Mostrar' : 'Ocultar';
  }));
  const volver = parametro('volver') || 'index.html';

  /* ---------- Login ---------- */
  const login = $('#form-login');
  if (login) {
    const validar = activarValidacion(login, { correo: Reglas.correo, clave: Reglas.requerido('La contraseña es obligatoria.') });
    login.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validar()) return;
      await asegurarUsuarioDemo();
      const u = Almacen.leer('usuarios', []).find(x => x.correo === login.correo.value.trim().toLowerCase());
      if (!u || u.hash !== await hashTexto(login.clave.value)) {
        $('#error-login').textContent = 'El correo o la contraseña no son correctos.';
        login.clave.value = ''; login.clave.focus(); return;
      }
      Sesion.iniciar(u); aviso(`Bienvenido, ${u.nombre}.`, 'ok');
      setTimeout(() => location.href = volver, 700);
    });
  }

  /* ---------- Registro ---------- */
  const reg = $('#form-registro');
  if (reg) {
    const reglas = {
      tipo_documento: v => v ? '' : 'Selecciona el tipo de documento.',
      numero_documento: v => !v ? 'El número de documento es obligatorio.' : /^[A-Za-z0-9-]{5,15}$/.test(v) ? '' : 'Usa de 5 a 15 caracteres, solo números, letras o guiones.',
      nombre: Reglas.soloLetras('El nombre'), apellido: Reglas.soloLetras('El apellido'),
      correo: v => { const m = Reglas.correo(v); if (m) return m;
        return Almacen.leer('usuarios', []).some(u => u.correo === v.toLowerCase()) ? 'Ya existe una cuenta con este correo.' : ''; },
      telefono: Reglas.telefono, clave: Reglas.contrasena,
      clave2: (v, f) => !v ? 'Confirma la contraseña.' : v !== f.clave.value ? 'Las contraseñas no coinciden.' : '',
      terminos: v => v ? '' : 'Debes aceptar el tratamiento de datos personales.'
    };
    const validar = activarValidacion(reg, reglas);
    /* Medidor de seguridad de la contraseña */
    reg.clave.addEventListener('input', () => {
      const v = reg.clave.value; let n = 0;
      if (v.length >= 8) n++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) n++; if (/\d/.test(v)) n++; if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) n++;
      const txt = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'][n];
      const m = $('#medidor'); m.value = n; m.dataset.nivel = n; $('#medidor-txt').textContent = v ? `Seguridad: ${txt}` : '';
    });
    reg.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validar()) return;
      const usuarios = Almacen.leer('usuarios', []);
      const nuevo = { id_usuario: Math.max(1, ...usuarios.map(u => u.id_usuario)) + 1, tipo_documento: reg.tipo_documento.value, numero_documento: reg.numero_documento.value.trim(),
        nombre: reg.nombre.value.trim(), apellido: reg.apellido.value.trim(), correo: reg.correo.value.trim().toLowerCase(), telefono: reg.telefono.value.trim(), hash: await hashTexto(reg.clave.value) };
      if (usuarios.some(u => u.tipo_documento === nuevo.tipo_documento && u.numero_documento === nuevo.numero_documento)) {
        validarCampo(reg, 'numero_documento', () => 'Este documento ya está registrado.'); reg.numero_documento.focus(); return;
      }
      usuarios.push(nuevo); Almacen.guardar('usuarios', usuarios); Sesion.iniciar(nuevo);
      aviso('¡Cuenta creada con éxito!', 'ok');
      setTimeout(() => location.href = volver, 800);
    });
  }

  /* ---------- Contacto ---------- */
  const con = $('#form-contacto');
  if (con) {
    const validar = activarValidacion(con, {
      nombre: Reglas.soloLetras('El nombre'), correo: Reglas.correo, asunto: v => v ? '' : 'Selecciona un asunto.',
      mensaje: v => v.length < 20 ? 'Cuéntanos un poco más (mínimo 20 caracteres).' : ''
    });
    con.mensaje.addEventListener('input', () => $('#contador-msg').textContent = `${con.mensaje.value.length}/600`);
    con.addEventListener('submit', e => {
      e.preventDefault();
      if (!validar()) return;
      aviso('Mensaje enviado. Te responderemos en menos de 24 horas.', 'ok');
      con.reset(); $('#contador-msg').textContent = '0/600'; $$('.campo--ok', con).forEach(c => c.classList.remove('campo--ok'));
    });
  }
});
