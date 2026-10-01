import { useEffect, useMemo, useState } from 'react';
import { mapasApi } from '../api/mapasApi';

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

  const buscar = (texto) => {
    const t = (texto || '').trim().toLowerCase();
    if (!t) return paises;
    return paises.filter((p) => p.nombre.toLowerCase().includes(t) || p.codigoIso?.toLowerCase() === t);
  };

  return { paises, porIso, buscar, cargando, error };
}
