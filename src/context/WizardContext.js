import React, { createContext, useCallback, useMemo, useState } from 'react';

export const WizardContext = createContext(null);

// Borrador de la publicación compartido entre los pasos del wizard.
// Se mapea 1:1 al PublicacionCreateDto del backend en el paso de confirmación.
const borradorInicial = {
  pais: null,        // { paisId, nombre, codigoIso }
  ciudad: null,      // { ciudadId, paisId, nombre }
  alojamiento: null, // { nombreHostelHotel, direccionTextual, latitud, longitud, placeIdApi, experiencia }
  gastronomia: null, // { reseñaGeneral, restaurantes: [{ nombre, direccion, latitud, longitud, placeIdApi }] }
  recomendacion: null, // { contenido, agencias: [{ nombre, sitioWeb }] }
  imagenes: [],      // assets locales de expo-image-picker (se suben en el paso de confirmación)
};

export function WizardProvider({ children }) {
  const [borrador, setBorrador] = useState(borradorInicial);

  const actualizar = useCallback((parcial) => {
    setBorrador((prev) => ({ ...prev, ...parcial }));
  }, []);

  const reiniciar = useCallback(() => setBorrador(borradorInicial), []);

  // Construye el DTO tal cual lo espera POST /api/publicaciones
  const construirDto = useCallback((urlsImagenes = []) => {
    const { ciudad, alojamiento, gastronomia, recomendacion } = borrador;
    return {
      ciudadId: ciudad?.ciudadId,
      alojamiento: alojamiento?.nombreHostelHotel ? {
        nombreHostelHotel: alojamiento.nombreHostelHotel,
        direccionTextual: alojamiento.direccionTextual || null,
        latitud: alojamiento.latitud,
        longitud: alojamiento.longitud,
        placeIdApi: alojamiento.placeIdApi || null,
        experiencia: alojamiento.experiencia || null,
      } : null,
      experienciaGastronomica: (gastronomia?.reseñaGeneral || gastronomia?.restaurantes?.length) ? {
        reseñaGeneral: gastronomia.reseñaGeneral || null,
        restaurantes: (gastronomia.restaurantes || []).map((r) => ({
          nombre: r.nombre,
          direccion: r.direccion || null,
          latitud: r.latitud ?? null,
          longitud: r.longitud ?? null,
          placeIdApi: r.placeIdApi || null,
        })),
      } : null,
      recomendacion: (recomendacion?.contenido || recomendacion?.agencias?.length) ? {
        contenido: recomendacion.contenido || null,
        agencias: (recomendacion.agencias || []).map((a) => ({
          nombre: a.nombre,
          sitioWeb: a.sitioWeb || null,
        })),
      } : null,
      imagenes: urlsImagenes.map((u) => ({ imagenUrl: u.url, tipoCategoria: u.tipoCategoria || null })),
    };
  }, [borrador]);

  const value = useMemo(() => ({ borrador, actualizar, reiniciar, construirDto }), [borrador, actualizar, reiniciar, construirDto]);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
