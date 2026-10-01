import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';

// variant: 'primario' | 'secundario' | 'peligro' | 'texto'
export default function Button({ titulo, onPress, cargando, deshabilitado, variant = 'primario', style, icono }) {
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
        <Text style={[styles.texto, styles[`texto_${variant}`]]}>
          {icono ? `${icono}  ` : ''}{titulo}
        </Text>
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
  },
  v_primario: { backgroundColor: colors.primario },
  v_secundario: { backgroundColor: colors.superficieClara, borderWidth: 1, borderColor: colors.borde },
  v_peligro: { backgroundColor: colors.peligro },
  v_texto: { backgroundColor: 'transparent', minHeight: 40, paddingVertical: 8 },
  presionado: { opacity: 0.8 },
  inactivo: { opacity: 0.5 },
  texto: { fontSize: 16, fontWeight: '700' },
  texto_primario: { color: colors.fondo },
  texto_secundario: { color: colors.texto },
  texto_peligro: { color: colors.blanco },
  texto_texto: { color: colors.primario },
});
