import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatearFechaCorta, nombrePais, urlBandera } from '../../utils/formatters';

// Fila mínima de una publicación (inicio y favoritos): bandera, país, ciudad y, si se pide, la fecha.
// El contenido completo se ve al abrirla.
export default function TarjetaPublicacionCompacta({ publicacion, codigoIso, onPress, mostrarFecha = true }) {
  const bandera = urlBandera(codigoIso);
  const pais = nombrePais(codigoIso, publicacion.nombrePais);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fila, pressed && styles.presionada]}>
      {bandera ? (
        <Image source={{ uri: bandera }} style={styles.bandera} />
      ) : (
        <View style={[styles.bandera, styles.banderaVacia]} />
      )}
      <Text style={styles.pais} numberOfLines={1}>
        {pais}
        {publicacion.nombreCiudad ? <Text style={styles.ciudad}>{`  ${publicacion.nombreCiudad}`}</Text> : null}
      </Text>
      {mostrarFecha ? <Text style={styles.fecha}>{formatearFechaCorta(publicacion.fechaPublicacion)}</Text> : null}
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
  ciudad: { color: colors.textoSecundario, fontWeight: '300' },
  fecha: { color: colors.textoSecundario, fontSize: 13, fontVariant: ['tabular-nums'] },
});
