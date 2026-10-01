import { api } from './apiConfig';

export const reportesApi = {
  denunciar: (publicacionId, motivo, detalle) =>
    api.post('/reportes', { publicacionId, motivo, detalle }).then((r) => r.data),
  // Admin
  listar: (estado) => api.get('/reportes/admin', { params: estado ? { estado } : {} }).then((r) => r.data),
  resolver: (id, { estado, accionTomada, eliminarPublicacion, bloquearAutor, eliminarUsuario }) =>
    api.put(`/reportes/admin/${id}/resolver`, { estado, accionTomada, eliminarPublicacion, bloquearAutor, eliminarUsuario }).then((r) => r.data),
  notificaciones: (soloNoLeidas = false) =>
    api.get('/reportes/admin/notificaciones', { params: { soloNoLeidas } }).then((r) => r.data),
  marcarLeida: (id) => api.put(`/reportes/admin/notificaciones/${id}/leida`),
};
