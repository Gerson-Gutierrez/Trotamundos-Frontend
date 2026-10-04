/*
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PUERTO_BACKEND = 5200;

// Resuelve la URL del backend según dónde corre la app:
// - Web: localhost
// - Dispositivo físico / emulador con Expo Go: la misma IP de la PC que sirve el bundle (hostUri)
// Podés forzar una URL con la variable de entorno EXPO_PUBLIC_API_URL.
function resolverApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === 'web') return `http://localhost:${PUERTO_BACKEND}`;

  const hostUri = Constants.expoConfig?.hostUri; // ej. "192.168.1.20:8081"
  const host = hostUri ? hostUri.split(':')[0] : null;
  if (host) return `http://${host}:${PUERTO_BACKEND}`;

  // Emulador Android sin hostUri
  return Platform.OS === 'android'
    ? `http://10.0.2.2:${PUERTO_BACKEND}`
    : `http://localhost:${PUERTO_BACKEND}`;
}

export const API_BASE_URL = resolverApiUrl();

// Token de Cesium Ion (opcional). Sin token se usa imagen satelital de OpenStreetMap.
export const CESIUM_ION_TOKEN = process.env.EXPO_PUBLIC_CESIUM_ION_TOKEN || '';

export const STORAGE_KEYS = {
  token: 'trotamundos_token',
  usuario: 'trotamundos_usuario',
};
*/


import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PUERTO_BACKEND = 5200;

// ⚠️ PON AQUÍ LA IPV4 DE TU COMPUTADORA (ej. 192.168.0.10)
const IP_COMPUTADORA = '192.168.100.7'; 

function resolverApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === 'web') return `http://localhost:${PUERTO_BACKEND}`;

  // Si se usa --tunnel, hostUri contendrá 'ngrok', por lo que debemos usar la IP manual
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri && !hostUri.includes('ngrok')) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:${PUERTO_BACKEND}`;
  }

  // Respaldo para dispositivos físicos y emuladores
  return `http://${IP_COMPUTADORA}:${PUERTO_BACKEND}`;
}

export const API_BASE_URL = resolverApiUrl();

export const CESIUM_ION_TOKEN = process.env.EXPO_PUBLIC_CESIUM_ION_TOKEN || '';

export const STORAGE_KEYS = {
  token: 'trotamundos_token',
  usuario: 'trotamundos_usuario',
};