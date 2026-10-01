import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

// tipo: 'error' | 'exito' | 'info'
export default function Mensaje({ texto, tipo = 'error', style }) {
  if (!texto) return null;
  return (
    <View style={[styles.base, styles[tipo], style]}>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { padding: 12, borderRadius: 10, marginBottom: 14, borderWidth: 1 },
  error: { backgroundColor: '#3b1111', borderColor: colors.peligro },
  exito: { backgroundColor: '#0f2e1c', borderColor: colors.exito },
  info: { backgroundColor: colors.superficieClara, borderColor: colors.borde },
  texto: { color: colors.texto, fontSize: 14 },
});
