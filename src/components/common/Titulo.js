import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

export default function Titulo({ children, subtitulo, style }) {
  return (
    <View style={[styles.contenedor, style]}>
      <Text style={styles.titulo}>{children}</Text>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: 20 },
  titulo: { color: colors.texto, fontSize: 26, fontWeight: '800' },
  subtitulo: { color: colors.textoSecundario, marginTop: 4, fontSize: 14 },
});
