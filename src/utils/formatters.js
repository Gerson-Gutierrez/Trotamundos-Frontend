import { API_BASE_URL } from '../constants/config';

// El backend devuelve rutas relativas (/uploads/...). Las convierte en absolutas.
export function urlImagen(ruta) {
  if (!ruta) return null;
  if (/^https?:\/\//i.test(ruta)) return ruta;
  return `${API_BASE_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
}

export function formatearFecha(iso) {
  if (!iso) return '';
  const fecha = new Date(iso);
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const HORAS_RETENCION = 24;

// Texto con el tiempo que falta para que un reporte resuelto / alerta leída se elimine solo.
export function textoAutoEliminacion(isoResolucion) {
  if (!isoResolucion) return '';
  const restanteMs = new Date(isoResolucion).getTime() + HORAS_RETENCION * 3600 * 1000 - Date.now();
  if (restanteMs <= 0) return 'Se eliminará en breve';
  const horas = Math.floor(restanteMs / 3600000);
  if (horas >= 1) return `Se elimina automáticamente en ${horas} h`;
  return `Se elimina automáticamente en ${Math.max(1, Math.ceil(restanteMs / 60000))} min`;
}

export function formatearFechaHora(iso) {
  if (!iso) return '';
  const fecha = new Date(iso);
  return fecha.toLocaleString('es-AR', {
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
export function mensajeError(error, porDefecto = 'Ocurrió un error. Intentá de nuevo.') {
  const data = error?.response?.data;
  if (!data) return error?.message?.includes('Network') ? 'No se pudo conectar con el servidor.' : porDefecto;
  if (typeof data === 'string') return data;
  if (data.mensaje) return data.mensaje;
  if (data.errors) {
    const primero = Object.values(data.errors).flat()[0];
    if (primero) return primero;
  }
  if (data.title) return data.title;
  return porDefecto;
}
