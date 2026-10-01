import { useCallback, useEffect, useState } from 'react';
import { publicacionesApi } from '../api/publicacionesApi';

// Feed filtrado por país y/o ciudad. Si no hay filtro devuelve todo.
export function usePublicaciones({ paisId, ciudadId } = {}) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (esRefresco = false) => {
    if (esRefresco) setRefrescando(true);
    else setCargando(true);
    setError(null);
    try {
      const data = await publicacionesApi.feed({ paisId, ciudadId });
      setPublicaciones(data);
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [paisId, ciudadId]);

  // Recarga al cambiar los filtros (sincronización con datos externos)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargar(); }, [cargar]);

  return { publicaciones, cargando, refrescando, error, recargar: () => cargar(true) };
}
