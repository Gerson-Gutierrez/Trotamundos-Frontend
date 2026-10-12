import { api } from './apiConfig';

// Publicaciones de otros viajeros guardadas en el perfil del usuario
export const favoritosApi = {
  listar: () => api.get('/favoritos').then((r) => r.data),
  // Solo los ids: sirven para pintar el botón de guardar
  ids: () => api.get('/favoritos/ids').then((r) => r.data),
  guardar: (publicacionId) => api.put(`/favoritos/${publicacionId}`),
  quitar: (publicacionId) => api.delete(`/favoritos/${publicacionId}`),
};
