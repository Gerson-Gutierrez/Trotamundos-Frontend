import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// SecureStore en nativo (cifrado), localStorage en web.
const esWeb = Platform.OS === 'web';

export async function guardar(clave, valor) {
  if (esWeb) {
    try { window.localStorage.setItem(clave, valor); } catch {}
    return;
  }
  await SecureStore.setItemAsync(clave, valor);
}

export async function leer(clave) {
  if (esWeb) {
    try { return window.localStorage.getItem(clave); } catch { return null; }
  }
  return SecureStore.getItemAsync(clave);
}

export async function borrar(clave) {
  if (esWeb) {
    try { window.localStorage.removeItem(clave); } catch {}
    return;
  }
  await SecureStore.deleteItemAsync(clave);
}
