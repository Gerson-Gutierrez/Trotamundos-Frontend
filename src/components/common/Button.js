import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';
import Icono from './Icono';

const COLOR_TEXTO = { primario: colors.fondo, secundario: colors.texto, peligro: colors.blanco, texto: colors.primario };

// variant: 'primario' | 'secundario' | 'peligro' | 'texto'. `icono`: nombre de un icono de Icono.js.
export default function Button({ titulo, onPress, cargando, deshabilitado, variant = 'primario', style, textoStyle, icono }) {
  const inactivo = cargando || deshabilitado;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.base,
        styles[`v_${variant}`],
        pressed && styles.presionado,
        inactivo && styles.inactivo,
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={variant === 'primario' ? colors.fondo : colors.primario} />
      ) : (
        <View style={styles.contenido}>
          {icono ? <Icono nombre={icono} size={18} color={COLOR_TEXTO[variant]} /> : null}
          <Text style={[styles.texto, styles[`texto_${variant}`], textoStyle]}>{t(titulo)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    maxWidth: '100%',
  },
  v_primario: { backgroundColor: colors.primario },
  v_secundario: { backgroundColor: colors.superficieClara, borderWidth: 1, borderColor: colors.borde },
  v_peligro: { backgroundColor: colors.peligro },
  v_texto: { backgroundColor: 'transparent', minHeight: 40, paddingVertical: 8 },
  contenido: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 1 },
  presionado: { opacity: 0.8 },
  inactivo: { opacity: 0.5 },
  texto: { fontSize: 16, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  texto_primario: { color: colors.fondo },
  texto_secundario: { color: colors.texto },
  texto_peligro: { color: colors.blanco },
  texto_texto: { color: colors.primario },
});
