import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { avisar } from '../../utils/dialogos';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants/colors';

// Abre la galería y devuelve los assets elegidos (expo-image-picker).
export async function elegirImagenes({ multiple = false, limite = 10 } = {}) {
  if (Platform.OS !== 'web') {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      avisar('Permiso necesario', 'Habilitá el acceso a tus fotos para subir imágenes.');
      return [];
    }
  }
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: multiple,
    selectionLimit: multiple ? limite : 1,
    quality: 0.8,
  });
  return resultado.canceled ? [] : resultado.assets;
}

// Avatar circular con botón para cambiar la foto (registro / perfil).
export default function SelectorImagen({ uri, onSeleccion, tamano = 110, etiqueta = 'Elegir foto' }) {
  const elegir = async () => {
    const [asset] = await elegirImagenes();
    if (asset) onSeleccion?.(asset);
  };

  return (
    <Pressable onPress={elegir} style={styles.contenedor}>
      {uri ? (
        <Image source={{ uri }} style={[styles.imagen, { width: tamano, height: tamano, borderRadius: tamano / 2 }]} />
      ) : (
        <View style={[styles.vacio, { width: tamano, height: tamano, borderRadius: tamano / 2 }]}>
          <Text style={styles.icono}>📷</Text>
        </View>
      )}
      <Text style={styles.etiqueta}>{etiqueta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedor: { alignItems: 'center', marginBottom: 20 },
  imagen: { backgroundColor: colors.superficieClara, borderWidth: 2, borderColor: colors.primario },
  vacio: {
    backgroundColor: colors.superficie, borderWidth: 2, borderColor: colors.borde, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  icono: { fontSize: 32 },
  etiqueta: { color: colors.primario, marginTop: 8, fontWeight: '600' },
});
