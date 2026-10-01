import { api } from './apiConfig';

// Solo administración
export const usuariosApi = {
  listar: () => api.get('/usuarios/admin').then((r) => r.data),
  bloquear: (id) => api.put(`/usuarios/admin/${id}/bloquear`).then((r) => r.data),
  desbloquear: (id) => api.put(`/usuarios/admin/${id}/desbloquear`).then((r) => r.data),
  eliminar: (id) => api.delete(`/usuarios/admin/${id}`).then((r) => r.data),
};
