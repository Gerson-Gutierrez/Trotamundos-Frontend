import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { colors } from '../constants/colors';
import { cargarIdiomaGuardado, guardarIdioma, i18n } from './index';

// Carga el idioma guardado antes de dibujar nada, para no mostrar un destello en otro idioma.
export function I18nProvider({ children }) {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    cargarIdiomaGuardado().then(() => setListo(true));
  }, []);

  if (!listo) return <View style={{ flex: 1, backgroundColor: colors.fondo }} />;
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

// Idioma actual y función para cambiarlo. Se vuelve a renderizar cuando cambia el idioma.
export function useIdioma() {
  const { i18n: instancia } = useTranslation();
  const cambiarIdioma = useCallback((codigo) => guardarIdioma(codigo), []);
  return useMemo(() => ({ idioma: instancia.language, cambiarIdioma }), [instancia.language, cambiarIdioma]);
}
