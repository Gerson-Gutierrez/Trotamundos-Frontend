import { api } from './apiConfig';

export const mapasApi = {
  // Lista completa o filtrada por nombre (buscador)
  paises: (q) => api.get('/mapas/paises', { params: q ? { q } : {} }).then((r) => r.data),
  // Resuelve el país desde el código ISO que devuelve el globo (ej. "AR")
  paisPorIso: (codigoIso) => api.get(`/mapas/paises/iso/${codigoIso}`).then((r) => r.data),
  // Ciudades registradas + catálogo mundial del país. `q` filtra por nombre en el
  // servidor: hay países con miles de ciudades y no conviene traerlas todas.
  ciudades: (paisId, soloConPublicaciones = false, { q, limite } = {}) =>
    api.get(`/mapas/paises/${paisId}/ciudades`, {
      params: { soloConPublicaciones, q: q || undefined, limite },
    }).then((r) => r.data),
  // Find-or-create de la ciudad donde está el viajero
  crearCiudad: (paisId, nombre, placeIdApi = null) =>
    api.post('/mapas/ciudades', { paisId, nombre, placeIdApi }).then((r) => r.data),
};
