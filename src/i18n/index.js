import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { guardar, leer } from '../utils/storage';
import en from './en';
import pt from './pt';
import fr from './fr';

// Traducción con i18next + react-i18next.
// Los textos de la app están escritos en español y ese texto es la clave de cada traducción:
// el español no necesita diccionario y, si a un idioma le falta una frase, se muestra en español.
export const IDIOMAS = [
  { codigo: 'en', nombre: 'English', local: 'en-US' },
  { codigo: 'es', nombre: 'Español', local: 'es-AR' },
  { codigo: 'pt', nombre: 'Português', local: 'pt-BR' },
  { codigo: 'fr', nombre: 'Français', local: 'fr-FR' },
];

// La primera vez que se usa la app (o se registra un usuario) arranca en inglés.
export const IDIOMA_POR_DEFECTO = 'en';
const CLAVE_IDIOMA = 'trotamundos_idioma';
const esValido = (codigo) => IDIOMAS.some((i) => i.codigo === codigo);

// Instancia propia de i18next (no la global) enlazada con react-i18next
const i18n = createInstance();
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
    fr: { translation: fr },
  },
  lng: IDIOMA_POR_DEFECTO,
  fallbackLng: false,
  // Las claves son frases con puntos y dos puntos: no se usan como separadores de ruta/espacio de nombres
  keySeparator: false,
  nsSeparator: false,
  // Los parámetros se escriben {nombre} (no {{nombre}})
  interpolation: { prefix: '{', suffix: '}', escapeValue: false },
  initAsync: false,
  react: { useSuspense: false },
});

export { i18n };

/**
 * Traduce un texto de la interfaz. Admite parámetros: t('Hola {nombre}', { nombre: 'Ana' }).
 * Es una función normal: al cambiar el idioma la navegación se vuelve a montar (ver AppNavigator).
 */
export function t(clave, params) {
  if (clave == null || clave === '') return clave;
  return i18n.t(clave, params);
}

export const idiomaActual = () => (esValido(i18n.language) ? i18n.language : IDIOMA_POR_DEFECTO);
export const localActual = () => (IDIOMAS.find((i) => i.codigo === idiomaActual()) || IDIOMAS[0]).local;

// Lee el idioma que el usuario eligió la última vez (queda así hasta que lo cambie)
export async function cargarIdiomaGuardado() {
  const guardado = await leer(CLAVE_IDIOMA).catch(() => null);
  const codigo = esValido(guardado) ? guardado : IDIOMA_POR_DEFECTO;
  await i18n.changeLanguage(codigo);
  return codigo;
}

export async function guardarIdioma(codigo) {
  const elegido = esValido(codigo) ? codigo : IDIOMA_POR_DEFECTO;
  await i18n.changeLanguage(elegido);
  await guardar(CLAVE_IDIOMA, elegido).catch(() => {});
  return elegido;
}
