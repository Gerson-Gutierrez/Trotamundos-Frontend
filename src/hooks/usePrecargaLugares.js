import { useEffect } from 'react';
import { lugaresApi } from '../api/lugaresApi';

/**
 * Pide por adelantado los lugares de la ciudad al entrar a un paso del asistente.
 * La primera consulta a OpenStreetMap tarda unos segundos; haciéndola mientras el
 * usuario lee la pantalla, cuando empieza a escribir los resultados ya están listos.
 */
export function usePrecargaLugares(categoria, ciudad, codigoPais) {
  useEffect(() => {
    if (!categoria || !ciudad) return;
    // No se espera el resultado ni se muestra error: es solo para ganar tiempo
    lugaresApi.precargar(categoria, { ciudad, pais: codigoPais }).catch(() => {});
  }, [categoria, ciudad, codigoPais]);
}
