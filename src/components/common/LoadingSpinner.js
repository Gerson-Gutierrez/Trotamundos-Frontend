import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';

export default function LoadingSpinner({ mensaje, pantallaCompleta = true }) {
  return (
    <View style={[styles.contenedor, pantallaCompleta && styles.completa]}>
      <ActivityIndicator size="large" color={colors.primario} />
      {mensaje ? <Text style={styles.texto}>{t(mensaje)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  completa: { flex: 1, backgroundColor: colors.fondo },
  texto: { color: colors.textoSecundario, marginTop: 12 },
});
