import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';
import Icono from '../common/Icono';

// Bloque visual reutilizado por las secciones del detalle. `icono`: nombre de un icono de Icono.js
export default function Seccion({ titulo, icono, children, style }) {
  return (
    <View style={[styles.seccion, style]}>
      <View style={styles.cabecera}>
        {icono ? <Icono nombre={icono} size={22} color={colors.primario} /> : null}
        <Text style={styles.titulo}>{t(titulo)}</Text>
      </View>
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
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  titulo: { color: colors.texto, fontSize: 18, fontWeight: '800', flexShrink: 1 },
});
