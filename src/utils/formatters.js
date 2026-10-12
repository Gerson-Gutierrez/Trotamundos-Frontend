import { API_BASE_URL } from '../constants/config';
import countries from 'i18n-iso-countries';
import enPaises from 'i18n-iso-countries/langs/en.json';
import esPaises from 'i18n-iso-countries/langs/es.json';
import ptPaises from 'i18n-iso-countries/langs/pt.json';
import frPaises from 'i18n-iso-countries/langs/fr.json';
import { idiomaActual, localActual, t } from '../i18n';

// El backend devuelve rutas relativas (/uploads/...). Las convierte en absolutas.
export function urlImagen(ruta) {
  if (!ruta) return null;
  if (/^https?:\/\//i.test(ruta)) return ruta;
  return `${API_BASE_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
}

export function formatearFecha(iso) {
  if (!iso) return '';
  const fecha = new Date(iso);
  return fecha.toLocaleDateString(localActual(), { day: '2-digit', month: 'short', year: 'numeric' });
}

// Nombres de países en cada idioma (librería i18n-iso-countries)
countries.registerLocale(enPaises);
countries.registerLocale(esPaises);
countries.registerLocale(ptPaises);
countries.registerLocale(frPaises);

// Nombre de un país en el idioma de la app a partir de su código ISO (AR → Argentina / Argentine / Argentina).
// Si el código no está en la librería se usa el nombre que manda el servidor (en español).
export function nombrePais(codigoIso, nombreServidor = '') {
  if (!codigoIso) return nombreServidor;
  return countries.getName(String(codigoIso).toUpperCase(), idiomaActual()) || nombreServidor;
}

// Instagram opcional: acepta "usuario", "@usuario" o el enlace al perfil.
// Devuelve { usuario } (null si está vacío) o { error } con un texto traducible.
export function normalizarInstagram(entrada) {
  const texto = (entrada || '').trim();
  if (!texto) return { usuario: null };
  const enlace = texto.match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#\s]+)/i);
  const limpio = (enlace ? enlace[1] : texto).replace(/^@+/, '');
  if (!/^[A-Za-z0-9._]{1,30}$/.test(limpio)) {
    return { error: 'El usuario de Instagram no es válido. Usá solo letras, números, puntos y guiones bajos (máx. 30).' };
  }
  return { usuario: limpio };
}

// Fecha numérica corta: 7/10/26
export function formatearFechaCorta(iso) {
  if (!iso) return '';
  const f = new Date(iso);
  if (Number.isNaN(f.getTime())) return '';
  return `${f.getDate()}/${f.getMonth() + 1}/${String(f.getFullYear()).slice(-2)}`;
}

// Imagen de la bandera a partir del código ISO alfa-2 (los emojis de bandera no se ven en todas las plataformas)
export function urlBandera(codigoIso) {
  return codigoIso ? `https://flagcdn.com/w40/${String(codigoIso).toLowerCase()}.png` : null;
}

const HORAS_RETENCION = 24;

// Texto con el tiempo que falta para que un reporte resuelto / alerta leída se elimine solo.
export function textoAutoEliminacion(isoResolucion) {
  if (!isoResolucion) return '';
  const restanteMs = new Date(isoResolucion).getTime() + HORAS_RETENCION * 3600 * 1000 - Date.now();
  if (restanteMs <= 0) return t('Se eliminará en breve');
  const horas = Math.floor(restanteMs / 3600000);
  if (horas >= 1) return t('Se elimina automáticamente en {n} h', { n: horas });
  return t('Se elimina automáticamente en {n} min', { n: Math.max(1, Math.ceil(restanteMs / 60000)) });
}

export function formatearFechaHora(iso) {
  if (!iso) return '';
  const fecha = new Date(iso);
  return fecha.toLocaleString(localActual(), {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function iniciales(nombreCompleto = '') {
  return nombreCompleto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

// Muestra una URL de forma legible: sin protocolo, sin "www." y sin barra final
export function sinProtocolo(url) {
  return String(url || '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
}

// Completa el protocolo de lo que el usuario escribe a mano (ej. "agencia.com")
export function normalizarUrl(url) {
  const texto = (url || '').trim();
  if (!texto) return null;
  return /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;
}

// Extrae un mensaje legible de un error de axios / backend
// Los mensajes del servidor vienen en español: se traducen cuando existe la traducción.
export function mensajeError(error, porDefecto = 'Ocurrió un error. Intentá de nuevo.') {
  const data = error?.response?.data;
  if (!data) return t(error?.message?.includes('Network') ? 'No se pudo conectar con el servidor.' : porDefecto);
  if (typeof data === 'string') return t(data);
  if (data.mensaje) return t(data.mensaje);
  if (data.errors) {
    const primero = Object.values(data.errors).flat()[0];
    if (primero) return t(primero);
  }
  if (data.title) return t(data.title);
  return t(porDefecto);
}
