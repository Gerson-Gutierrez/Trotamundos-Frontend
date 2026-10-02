import { api } from './apiConfig';

// Solo superadministración
export const superAdminApi = {
  cuentas: () => api.get('/superadmin/cuentas').then((r) => r.data),
  invitar: (email, esSuperAdmin) =>
    api.post('/superadmin/invitaciones', { email, esSuperAdmin }).then((r) => r.data),
  recuperarPassword: (id) => api.post(`/superadmin/cuentas/${id}/recuperar-password`).then((r) => r.data),
  eliminarAdministrador: (id, motivo) =>
    api.delete(`/superadmin/administradores/${id}`, { data: { motivo: motivo || null } }).then((r) => r.data),
  correosBloqueados: () => api.get('/superadmin/correos-bloqueados').then((r) => r.data),
  desbloquearCorreo: (email) =>
    api.delete('/superadmin/correos-bloqueados', { params: { email } }).then((r) => r.data),
};
