import { api } from './apiConfig';

export const publicacionesApi = {
  feed: ({ paisId, ciudadId } = {}) =>
    api.get('/publicaciones', { params: { paisId, ciudadId } }).then((r) => r.data),
  obtener: (id) => api.get(`/publicaciones/${id}`).then((r) => r.data),
  mias: () => api.get('/publicaciones/mias').then((r) => r.data),
  crear: (dto) => api.post('/publicaciones', dto).then((r) => r.data),
  eliminar: (id) => api.delete(`/publicaciones/${id}`),
  // Admin
  todasAdmin: (incluirEliminadas = false) =>
    api.get('/publicaciones/admin', { params: { incluirEliminadas } }).then((r) => r.data),
};
