import { useCallback, useEffect, useRef, useState } from 'react';
import { publicacionesApi } from '../api/publicacionesApi';

// Feed filtrado por país y/o ciudad. Si no hay filtro devuelve todo.
// `version`: cambiarla fuerza una recarga (p. ej. al tocar "Inicio" en el menú).
export function usePublicaciones({ paisId, ciudadId, version = 0 } = {}) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);
  // Solo la última petición actualiza el estado: si el filtro cambia mientras otra
  // está en vuelo, la respuesta vieja no debe pisar a la nueva.
  const ultimaPeticion = useRef(0);

  const cargar = useCallback(async (esRefresco = false) => {
    const id = ++ultimaPeticion.current;
    if (esRefresco) setRefrescando(true);
    else setCargando(true);
    setError(null);
    try {
      const data = await publicacionesApi.feed({ paisId, ciudadId });
      if (id === ultimaPeticion.current) setPublicaciones(data);
    } catch (e) {
      if (id === ultimaPeticion.current) setError(e);
    } finally {
      if (id === ultimaPeticion.current) {
        setCargando(false);
        setRefrescando(false);
      }
    }
  }, [paisId, ciudadId, version]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recarga al cambiar los filtros (sincronización con datos externos)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargar(); }, [cargar]);

  return { publicaciones, cargando, refrescando, error, recargar: () => cargar(true) };
}
