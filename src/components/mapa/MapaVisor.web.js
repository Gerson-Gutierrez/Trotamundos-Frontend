import React from 'react';
import MapaPicker from './MapaPicker.web';

// En web ya existe un mapa Leaflet en iframe: se usa en modo solo lectura.
export default function MapaVisor({ latitud, longitud, altura = 350, titulo }) {
  return <MapaPicker latitud={latitud} longitud={longitud} editable={false} altura={altura} titulo={titulo} />;
}
