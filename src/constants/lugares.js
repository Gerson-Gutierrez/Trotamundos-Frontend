// Clasificación de lugares según las etiquetas de OpenStreetMap (class/type que
// devuelve Nominatim), para distinguir alojamientos, restaurantes, puntos de
// interés y direcciones comunes.

export const CATEGORIAS = {
  alojamiento: { icono: '🏨', etiqueta: 'Alojamiento' },
  restaurante: { icono: '🍽️', etiqueta: 'Restaurante' },
  agencia: { icono: '🎫', etiqueta: 'Agencia de turismo' },
  lugar: { icono: '📌', etiqueta: 'Lugar' },
  direccion: { icono: '📍', etiqueta: 'Dirección' },
};

// type de OSM -> subetiqueta legible en español
const ALOJAMIENTOS = {
  hotel: 'Hotel',
  hostel: 'Hostel',
  motel: 'Motel',
  guest_house: 'Casa de huéspedes',
  apartment: 'Departamento',
  apartments: 'Departamentos',
  chalet: 'Cabaña',
  bungalow: 'Bungalow',
  camp_site: 'Camping',
  caravan_site: 'Camping rodante',
  alpine_hut: 'Refugio',
  wilderness_hut: 'Refugio',
  resort: 'Resort',
  love_hotel: 'Hotel',
};

const GASTRONOMIA = {
  restaurant: 'Restaurante',
  fast_food: 'Comida rápida',
  cafe: 'Café',
  bar: 'Bar',
  pub: 'Pub',
  biergarten: 'Cervecería',
  bbq: 'Parrilla',
  nightclub: 'Bar',
  canteen: 'Comedor',
  food_court: 'Patio de comidas',
  ice_cream: 'Heladería',
  bakery: 'Panadería',
  pastry: 'Pastelería',
  confectionery: 'Repostería',
  deli: 'Rotisería',
  butcher: 'Carnicería',
  coffee: 'Café',
  winery: 'Bodega',
  alcohol: 'Vinoteca',
};

// Agencias de turismo y oficinas de información turística
const AGENCIAS = {
  travel_agency: 'Agencia de viajes',
  travel_agent: 'Agencia de viajes',
  tour_operator: 'Operador turístico',
  tour: 'Excursiones',
  guide: 'Guía turístico',
};

const PUNTOS_DE_INTERES = {
  attraction: 'Atracción',
  museum: 'Museo',
  gallery: 'Galería',
  artwork: 'Obra de arte',
  viewpoint: 'Mirador',
  theme_park: 'Parque temático',
  zoo: 'Zoológico',
  aquarium: 'Acuario',
  information: 'Información turística',
  picnic_site: 'Área de pícnic',
  park: 'Parque',
  garden: 'Jardín',
  nature_reserve: 'Reserva natural',
  beach: 'Playa',
  peak: 'Cerro',
  volcano: 'Volcán',
  waterfall: 'Cascada',
  glacier: 'Glaciar',
  theatre: 'Teatro',
  cinema: 'Cine',
  place_of_worship: 'Templo',
  marketplace: 'Mercado',
  castle: 'Castillo',
  monument: 'Monumento',
  memorial: 'Memorial',
  ruins: 'Ruinas',
  archaeological_site: 'Sitio arqueológico',
};

/**
 * Devuelve { categoria, icono, etiqueta } a partir de las etiquetas OSM.
 * @param {string} clase  campo `class` (o `category`) de Nominatim: tourism, amenity, shop…
 * @param {string} tipo   campo `type`: hotel, restaurant, house…
 */
export function clasificarLugar(clase, tipo) {
  const armar = (categoria, subetiqueta) => ({
    categoria,
    icono: CATEGORIAS[categoria].icono,
    etiqueta: subetiqueta || CATEGORIAS[categoria].etiqueta,
  });

  if (clase === 'tourism' && ALOJAMIENTOS[tipo]) return armar('alojamiento', ALOJAMIENTOS[tipo]);
  if (clase === 'building' && ALOJAMIENTOS[tipo]) return armar('alojamiento', ALOJAMIENTOS[tipo]);
  if (clase === 'leisure' && tipo === 'resort') return armar('alojamiento', 'Resort');

  // Agencias de turismo: shop=travel_agency, office=travel_agent, tourism=information
  if (AGENCIAS[tipo]) return armar('agencia', AGENCIAS[tipo]);
  if (clase === 'tourism' && tipo === 'information') return armar('agencia', 'Oficina de turismo');
  if (clase === 'information' && tipo === 'office') return armar('agencia', 'Oficina de turismo');

  if ((clase === 'amenity' || clase === 'shop') && GASTRONOMIA[tipo]) {
    return armar('restaurante', GASTRONOMIA[tipo]);
  }
  if (clase === 'craft' && tipo === 'brewery') return armar('restaurante', 'Cervecería');

  if (PUNTOS_DE_INTERES[tipo] && clase !== 'place' && clase !== 'boundary') {
    return armar('lugar', PUNTOS_DE_INTERES[tipo]);
  }
  if (clase === 'historic') return armar('lugar', PUNTOS_DE_INTERES[tipo] || 'Sitio histórico');

  // Calles, alturas, ciudades y edificios sin uso definido: se tratan como dirección
  return armar('direccion');
}
