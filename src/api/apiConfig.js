import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/config';
import { leer } from '../utils/storage';

// eslint-disable-next-line import/no-named-as-default-member
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Callback que registra AuthContext para cerrar sesión cuando el backend responde 401
// (token vencido o cuenta bloqueada).
let onNoAutorizado = null;
export function registrarHandlerNoAutorizado(fn) {
  onNoAutorizado = fn;
}

api.interceptors.request.use(async (config) => {
  const token = await leer(STORAGE_KEYS.token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    // El login también devuelve 401 con credenciales inválidas: no cerrar sesión en ese caso
    if (status === 401 && !url.includes('/auth/login') && onNoAutorizado) {
      onNoAutorizado();
    }
    return Promise.reject(error);
  }
);

// Helper para multipart (subida de imágenes). En web hay que pasar un Blob;
// en nativo, el objeto { uri, name, type }.
export function crearFormDataArchivo(campo, archivo) {
  const form = new FormData();
  form.append(campo, archivo);
  return form;
}
