import { api } from './apiConfig';

export const authApi = {
  registro: (datos) => api.post('/auth/registro', datos).then((r) => r.data),
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  solicitarRecuperacion: (email) => api.post('/auth/solicitar-recuperacion', { email }).then((r) => r.data),
  resetearPassword: (token, nuevaPassword) =>
    api.post('/auth/resetear-password', { token, nuevaPassword }).then((r) => r.data),
  invitarAdmin: (email) => api.post('/admin/invitations', { email }).then((r) => r.data),
  aceptarInvitacionAdmin: (token, fullName, password) =>
    api.post('/admin/accept-invitation', { token, fullName, password }).then((r) => r.data),
  obtenerPerfil: () => api.get('/auth/perfil').then((r) => r.data),
  actualizarPerfil: (datos) => api.put('/auth/perfil', datos).then((r) => r.data),
};
