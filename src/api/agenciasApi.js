import { api } from './apiConfig';

export const agenciasApi = {
  // Busca la agencia en la web y devuelve [{ nombre, url, descripcion, fuente }].
  // La búsqueda ocurre en el backend para no exponer claves en la app.
  // Devuelve [{ nombre, url, descripcion, fuente }] uniendo agencias locales y web
  buscar: (q, { pais, ciudad, signal } = {}) =>
    api.get('/agencias/buscar', { params: { q, pais, ciudad }, signal }).then((r) => r.data),
};
