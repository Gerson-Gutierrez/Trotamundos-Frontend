import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';

export default function Input({ etiqueta, error, style, inputStyle, multiline, placeholder, ...props }) {
  return (
    <View style={[styles.contenedor, style]}>
      {etiqueta ? <Text style={styles.etiqueta}>{t(etiqueta)}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textoSecundario}
        placeholder={placeholder ? t(placeholder) : undefined}
        style={[styles.input, multiline && styles.multiline, error && styles.inputError, inputStyle]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
      {error ? <Text style={styles.error}>{t(error)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: 14 },
  etiqueta: { color: colors.textoSecundario, marginBottom: 6, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.texto,
    fontSize: 16,
  },
  multiline: { minHeight: 110 },
  inputError: { borderColor: colors.peligro },
  error: { color: colors.peligro, marginTop: 4, fontSize: 12 },
});
