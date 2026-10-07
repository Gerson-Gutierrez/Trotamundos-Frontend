import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatearFechaCorta, urlBandera } from '../../utils/formatters';

// Fila mínima del feed del inicio: bandera, país y fecha. El contenido completo se ve al abrirla.
export default function TarjetaPublicacionCompacta({ publicacion, codigoIso, onPress }) {
  const bandera = urlBandera(codigoIso);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fila, pressed && styles.presionada]}>
      {bandera ? (
        <Image source={{ uri: bandera }} style={styles.bandera} />
      ) : (
        <View style={[styles.bandera, styles.banderaVacia]} />
      )}
      <Text style={styles.pais} numberOfLines={1}>{publicacion.nombrePais}</Text>
      <Text style={styles.fecha}>{formatearFechaCorta(publicacion.fechaPublicacion)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  presionada: { opacity: 0.8 },
  bandera: { width: 28, height: 20, borderRadius: 3, backgroundColor: colors.superficieClara },
  banderaVacia: { borderWidth: 1, borderColor: colors.borde },
  pais: { flex: 1, color: colors.texto, fontSize: 15, fontWeight: '700' },
  fecha: { color: colors.textoSecundario, fontSize: 13, fontVariant: ['tabular-nums'] },
});
