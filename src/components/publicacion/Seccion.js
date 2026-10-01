import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

// Bloque visual reutilizado por las secciones del detalle
export default function Seccion({ titulo, children, style }) {
  return (
    <View style={[styles.seccion, style]}>
      <Text style={styles.titulo}>{titulo}</Text>
      {children}
    </View>
  );
}

export const estilosSeccion = StyleSheet.create({
  parrafo: { color: colors.texto, fontSize: 15, lineHeight: 22 },
  subtitulo: { color: colors.primario, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  secundario: { color: colors.textoSecundario, fontSize: 13, marginBottom: 8 },
  //item: { backgroundColor: colors.superficieClara, borderRadius: 12, padding: 12, marginTop: 10 },
  item: {
  backgroundColor: 'transparent',
  borderRadius: 0,
  padding: 0,
  marginTop: 2,
  shadowOpacity: 0,
  elevation: 0,
},
});

const styles = StyleSheet.create({
  seccion: {
    backgroundColor: colors.superficie,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  titulo: { color: colors.texto, fontSize: 18, fontWeight: '800', marginBottom: 10 },
});
