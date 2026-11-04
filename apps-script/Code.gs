/**
 * Caribe Caracas 2027 · Solicitudes del deck
 *
 * Recibe las solicitudes del formulario de la página, las guarda en esta hoja
 * y envía el deck cuando el estado de una fila cambia a "Aprobado".
 *
 * Instalación (una sola vez):
 * 1. Completa CONFIG abajo (correo de aviso y enlace del deck).
 * 2. Ejecuta la función instalar() y acepta los permisos.
 * 3. Implementar → Nueva implementación → Aplicación web.
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 * 4. Copia la URL de la aplicación web y pégala en SCRIPT_URL dentro de index.html.
 */

const CONFIG = {
  HOJA: 'Solicitudes',
  CORREO_AVISO: '',          // tu correo: recibes un aviso por cada solicitud nueva
  DECK_URL: '',              // enlace al deck (Drive, Claude, PDF). Vacío = no se envía nada
  ASUNTO_DECK: 'Caribe Caracas 2027 · Deck del festival',
  FIRMA: 'Equipo Caribe Caracas 2027',
  REMITENTE: '',             // opcional: alias verificado en Gmail (Configuración → Cuentas → Enviar correo como)
  RESPONDER_A: ''            // opcional: correo que recibe las respuestas
};

const COLUMNAS = ['Fecha', 'Nombre', 'Correo', 'Organización', 'Interés', 'Mensaje', 'Estado', 'Enviado', 'Notas'];
const COL = { correo: 3, nombre: 2, estado: 7, enviado: 8, notas: 9 };

/* ---------- Recepción del formulario ---------- */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    if (p['bot-field']) return respuesta_({ ok: true }); // trampa para bots
    const correo = String(p.correo || '').trim();
    if (!p.nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return respuesta_({ ok: false, error: 'datos_incompletos' });
    }
    const hoja = hoja_();
    hoja.appendRow([
      new Date(),
      limpiar_(p.nombre),
      correo,
      limpiar_(p.organizacion),
      limpiar_(p.perfil),
      limpiar_(p.mensaje),
      'Pendiente',
      '',
      ''
    ]);
    avisar_(p, correo);
    return respuesta_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return respuesta_({ ok: true, servicio: 'Caribe Caracas 2027 · solicitudes' });
}

/* ---------- Aprobación: envía el deck al marcar "Aprobado" ---------- */
function alEditar(e) {
  const rango = e.range;
  const hoja = rango.getSheet();
  if (hoja.getName() !== CONFIG.HOJA || rango.getColumn() !== COL.estado || rango.getRow() < 2) return;
  if (String(rango.getValue()).trim() !== 'Aprobado') return;
  enviarDeck_(hoja, rango.getRow());
}

/** Reintenta el envío en todas las filas aprobadas que todavía no se enviaron. */
function enviarAprobadosPendientes() {
  const hoja = hoja_();
  const ultima = hoja.getLastRow();
  for (let fila = 2; fila <= ultima; fila++) {
    const estado = hoja.getRange(fila, COL.estado).getValue();
    const enviado = hoja.getRange(fila, COL.enviado).getValue();
    if (estado === 'Aprobado' && !enviado) enviarDeck_(hoja, fila);
  }
}

function enviarDeck_(hoja, fila) {
  const enviado = hoja.getRange(fila, COL.enviado);
  const notas = hoja.getRange(fila, COL.notas);
  if (enviado.getValue()) return; // ya se envió
  if (!CONFIG.DECK_URL) {
    notas.setValue('Falta el enlace del deck en CONFIG.DECK_URL');
    return;
  }
  const correo = hoja.getRange(fila, COL.correo).getValue();
  const nombre = String(hoja.getRange(fila, COL.nombre).getValue()).split(' ')[0];
  const cuerpo =
    'Hola ' + nombre + ':\n\n' +
    'Gracias por tu interés en Caribe Caracas 2027. Aquí tienes el deck del festival:\n\n' +
    CONFIG.DECK_URL + '\n\n' +
    'Quedamos atentos a tus comentarios.\n\n' + CONFIG.FIRMA;
  const html =
    '<p>Hola ' + escapar_(nombre) + ':</p>' +
    '<p>Gracias por tu interés en Caribe Caracas 2027. Aquí tienes el deck del festival:</p>' +
    '<p><a href="' + CONFIG.DECK_URL + '">Ver el deck</a></p>' +
    '<p>Quedamos atentos a tus comentarios.</p><p>' + escapar_(CONFIG.FIRMA) + '</p>';
  try {
    const opciones = { htmlBody: html, name: CONFIG.FIRMA };
    if (CONFIG.RESPONDER_A) opciones.replyTo = CONFIG.RESPONDER_A;
    if (CONFIG.REMITENTE) {
      opciones.from = CONFIG.REMITENTE; // debe ser un alias verificado de esta cuenta
      GmailApp.sendEmail(correo, CONFIG.ASUNTO_DECK, cuerpo, opciones);
    } else {
      MailApp.sendEmail(correo, CONFIG.ASUNTO_DECK, cuerpo, opciones);
    }
    enviado.setValue(new Date());
    notas.setValue('');
  } catch (err) {
    notas.setValue('No se pudo enviar: ' + err.message);
  }
}

/* ---------- Instalación ---------- */
function instalar() {
  const hoja = hoja_();
  const reglas = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pendiente', 'Aprobado', 'Rechazado'], true)
    .setAllowInvalid(false).build();
  hoja.getRange(2, COL.estado, hoja.getMaxRows() - 1, 1).setDataValidation(reglas);
  // disparador instalable: los simples no pueden enviar correos
  const ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'alEditar')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('alEditar').forSpreadsheet(ss).onEdit().create();
}

/* ---------- Utilidades ---------- */
function hoja_() {
  const ss = SpreadsheetApp.getActive();
  let hoja = ss.getSheetByName(CONFIG.HOJA);
  if (!hoja) hoja = ss.insertSheet(CONFIG.HOJA);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(COLUMNAS);
    hoja.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold').setBackground('#D42A20').setFontColor('#FFFFFF');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function avisar_(p, correo) {
  if (!CONFIG.CORREO_AVISO) return;
  MailApp.sendEmail(CONFIG.CORREO_AVISO,
    'Nueva solicitud del deck: ' + limpiar_(p.nombre),
    'Nombre: ' + limpiar_(p.nombre) + '\nCorreo: ' + correo +
    '\nOrganización: ' + limpiar_(p.organizacion) + '\nInterés: ' + limpiar_(p.perfil) +
    '\nMensaje: ' + limpiar_(p.mensaje) +
    '\n\nPara aprobarla, cambia el estado a "Aprobado" en la hoja ' + CONFIG.HOJA + ':\n' +
    SpreadsheetApp.getActive().getUrl());
}

// evita que un texto empiece con =, +, - o @ y se interprete como fórmula
function limpiar_(v) {
  const s = String(v || '').trim().slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function escapar_(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
