import { useEffect, useMemo, useState } from 'react';
import { mapasApi } from '../api/mapasApi';
import { nombrePais } from '../utils/formatters';
import { localActual } from '../i18n';

// Cachea la lista de países en memoria (son ~250 y no cambian)
let cache = null;

export function usePaises() {
  const [paises, setPaises] = useState(cache || []);
  const [cargando, setCargando] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) return;
    let activo = true;
    mapasApi.paises()
      .then((data) => { cache = data; if (activo) setPaises(data); })
      .catch((e) => activo && setError(e))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []);

  const porIso = useMemo(() => {
    const mapa = {};
    for (const p of paises) if (p.codigoIso) mapa[p.codigoIso] = p;
    return mapa;
  }, [paises]);

  // El servidor los manda ordenados por su nombre en español: se reordenan según el idioma de la app
  const ordenados = () => [...paises].sort((a, b) =>
    nombrePais(a.codigoIso, a.nombre).localeCompare(nombrePais(b.codigoIso, b.nombre), localActual()));

  const buscar = (texto) => {
    const t = (texto || '').trim().toLowerCase();
    if (!t) return ordenados();
    // Busca por el nombre en el idioma de la app y también por el nombre original
    return ordenados().filter((p) =>
      p.nombre.toLowerCase().includes(t)
      || nombrePais(p.codigoIso, p.nombre).toLowerCase().includes(t)
      || p.codigoIso?.toLowerCase() === t);
  };

  return { paises, porIso, buscar, cargando, error };
}
