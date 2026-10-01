import { api } from './apiConfig';

export const lugaresApi = {
  /**
   * Busca alojamientos, restaurantes o agencias por nombre dentro de una ciudad.
   * El backend consulta los puntos de interés de OpenStreetMap (mucho más completo
   * que geocodificar) y cachea el listado de la ciudad para responder al instante.
   * @param categoria 'alojamiento' | 'restaurante' | 'agencia'
   */
  buscar: (categoria, q, { ciudad, pais, signal } = {}) =>
    api.get('/lugares/buscar', { params: { categoria, q, ciudad, pais }, signal }).then((r) => r.data),

  /**
   * Pide al backend que deje listo el listado de la ciudad. Se llama al entrar
   * al paso para que la primera búsqueda del usuario responda al instante.
   */
  precargar: (categoria, { ciudad, pais } = {}) =>
    api.post('/lugares/precargar', null, { params: { categoria, ciudad, pais } })
      .then((r) => r.data)
      .catch(() => null),
};
