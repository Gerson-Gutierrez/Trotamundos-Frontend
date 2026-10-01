import axios from 'axios';
import { clasificarLugar } from '../constants/lugares';

// Geocoding y búsqueda de lugares con Nominatim (OpenStreetMap). Sin API key.
// Política de uso: https://operations.osmfoundation.org/policies/nominatim/
// (máximo 1 consulta por segundo: quien llame debe usar debounce)
// eslint-disable-next-line import/no-named-as-default-member
const nominatim = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  timeout: 12000,
  headers: { 'Accept-Language': 'es' },
});

const MINIMO_CARACTERES = 3;

// Prioridad al mostrar resultados según lo que se esté buscando
const ORDEN_POR_CATEGORIA = {
  alojamiento: ['alojamiento', 'lugar', 'agencia', 'direccion', 'restaurante'],
  restaurante: ['restaurante', 'lugar', 'agencia', 'direccion', 'alojamiento'],
  agencia: ['agencia', 'lugar', 'direccion', 'alojamiento', 'restaurante'],
  lugar: ['lugar', 'agencia', 'alojamiento', 'restaurante', 'direccion'],
  direccion: ['direccion', 'lugar', 'agencia', 'alojamiento', 'restaurante'],
};

function ciudadDe(address = {}) {
  return address.city || address.town || address.village || address.hamlet || address.municipality || null;
}

// Nominatim repite el nombre del lugar al principio de display_name: se saca
// para que la dirección no diga "Hostel Lagares, Hostel Lagares, Av...".
function direccionSinNombre(displayName = '', nombre = '') {
  if (nombre && displayName.startsWith(`${nombre}, `)) return displayName.slice(nombre.length + 2);
  return displayName;
}

// OSM guarda la web en distintas etiquetas según quién cargó el dato
// Nominatim manda extratags: null cuando el lugar no tiene etiquetas extra,
// y un valor por defecto de parámetro no cubre null (solo undefined).
function sitioWebDe(extratags) {
  const tags = extratags || {};
  const url = tags.website || tags['contact:website'] || tags.url || tags['contact:url'];
  if (!url) return null;
  const limpia = String(url).trim().split(';')[0].trim();
  if (!limpia) return null;
  return /^https?:\/\//i.test(limpia) ? limpia : `https://${limpia}`;
}

function aLugar(r) {
  const clase = r.class || r.category;
  const { categoria, icono, etiqueta } = clasificarLugar(clase, r.type);
  const nombreCrudo = r.namedetails?.name || r.name || '';
  const direccion = direccionSinNombre(r.display_name || '', nombreCrudo);

  return {
    placeId: String(r.place_id),
    // Los lugares con nombre propio (hoteles, restaurantes) lo traen; una
    // dirección común no, y ahí el "nombre" es la dirección misma.
    nombre: nombreCrudo || direccion,
    direccion,
    direccionCompleta: r.display_name || '',
    categoria,
    icono,
    etiqueta,
    tieneNombrePropio: !!nombreCrudo,
    sitioWeb: sitioWebDe(r.extratags),
    latitud: parseFloat(r.lat),
    longitud: parseFloat(r.lon),
    ciudad: ciudadDe(r.address),
    codigoPais: r.address?.country_code?.toUpperCase() || null,
  };
}

function ordenar(lugares, categoria) {
  const orden = ORDEN_POR_CATEGORIA[categoria];
  if (!orden) return lugares;
  // Ordenamiento estable: respeta el ranking de Nominatim dentro de cada categoría
  return lugares
    .map((l, i) => ({ l, i }))
    .sort((a, b) => (orden.indexOf(a.l.categoria) - orden.indexOf(b.l.categoria)) || (a.i - b.i))
    .map((x) => x.l);
}

export const geocodingApi = {
  /**
   * Busca direcciones y lugares (alojamientos, restaurantes, puntos de interés).
   * @param {string} consulta texto escrito por el usuario
   * @param {object} opciones
   *   - codigoPais: ISO alpha-2 para limitar la búsqueda (ej. 'AR')
   *   - ciudad: nombre de la ciudad del viaje; sesga los resultados a esa zona
   *   - categoria: 'alojamiento' | 'restaurante' | 'lugar' | 'direccion' (solo ordena, no filtra)
   *   - limite: cantidad máxima de resultados
   *   - signal: AbortSignal para cancelar la consulta anterior
   * @returns {Promise<Array>} lugares { placeId, nombre, direccion, categoria, icono, etiqueta, latitud, longitud }
   */
  buscar: async (consulta, opciones = {}) => {
    // Compatibilidad: antes el segundo parámetro era el código de país
    const { codigoPais, ciudad, categoria, limite = 12, signal } =
      typeof opciones === 'string' ? { codigoPais: opciones } : opciones;

    const texto = (consulta || '').trim();
    if (texto.length < MINIMO_CARACTERES) return [];

    // Si el usuario no nombró la ciudad, se agrega para acotar la búsqueda
    const mencionaCiudad = ciudad && texto.toLowerCase().includes(ciudad.toLowerCase());
    const q = ciudad && !mencionaCiudad ? `${texto}, ${ciudad}` : texto;

    const params = { q, format: 'json', limit: limite, addressdetails: 1, namedetails: 1, extratags: 1 };
    if (codigoPais) params.countrycodes = codigoPais.toLowerCase();

    const { data } = await nominatim.get('/search', { params, signal });
    return ordenar(data.map(aLugar), categoria);
  },

  /** Coordenadas -> lugar (para "usar mi ubicación actual" y para nombrar un pin movido a mano). */
  inverso: async (latitud, longitud, { signal } = {}) => {
    const { data } = await nominatim.get('/reverse', {
      params: { lat: latitud, lon: longitud, format: 'json', addressdetails: 1, namedetails: 1, extratags: 1 },
      signal,
    });
    if (!data || data.error) return null;
    return { ...aLugar(data), latitud: parseFloat(data.lat), longitud: parseFloat(data.lon) };
  },
};
