import { Platform } from 'react-native';
import { api } from './apiConfig';

// Convierte un asset de expo-image-picker en la parte multipart que espera el backend.
async function aParteMultipart(asset) {
  const nombre = asset.fileName || `imagen_${Date.now()}.jpg`;
  const tipo = asset.mimeType || 'image/jpeg';

  if (Platform.OS === 'web') {
    // En web el uri es un blob:/data: URL: hay que convertirlo en Blob real
    const blob = await fetch(asset.uri).then((r) => r.blob());
    return new File([blob], nombre, { type: tipo });
  }
  return { uri: asset.uri, name: nombre, type: tipo };
}

async function subir(ruta, asset, campo = 'archivo') {
  const form = new FormData();
  form.append(campo, await aParteMultipart(asset));
  const res = await api.post(ruta, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return res.data;
}

export const archivosApi = {
  // Devuelve { url }
  subirFotoPerfil: (asset) => subir('/archivos/perfil', asset),
  subirImagenPublicacion: (asset) => subir('/archivos/publicaciones', asset),
  // Devuelve { urls: [] }
  subirImagenesPublicacion: async (assets) => {
    const form = new FormData();
    for (const a of assets) form.append('archivos', await aParteMultipart(a));
    const res = await api.post('/archivos/publicaciones/multiple', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },
};
