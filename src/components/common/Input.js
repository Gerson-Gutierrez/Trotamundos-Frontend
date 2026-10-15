import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';
import Icono from './Icono';

export default function Input({ etiqueta, error, style, inputStyle, multiline, placeholder, secureTextEntry, ...props }) {
  // En los campos de contraseña el ojo alterna entre ocultar y mostrar lo escrito
  const [visible, setVisible] = useState(false);
  const esPassword = !!secureTextEntry;

  const campo = (
    <TextInput
      placeholderTextColor={colors.textoSecundario}
      placeholder={placeholder ? t(placeholder) : undefined}
      style={[styles.input, multiline && styles.multiline, error && styles.inputError, esPassword && styles.inputPassword, inputStyle]}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      secureTextEntry={esPassword && !visible}
      {...props}
    />
  );

  return (
    <View style={[styles.contenedor, style]}>
      {etiqueta ? <Text style={styles.etiqueta}>{t(etiqueta)}</Text> : null}
      {esPassword ? (
        <View style={styles.envoltorio}>
          {campo}
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            style={styles.ojo}
            accessibilityRole="button"
            accessibilityLabel={t(visible ? 'Ocultar contraseña' : 'Mostrar contraseña')}
          >
            <Icono nombre={visible ? 'ocultarPassword' : 'verPassword'} size={22} color={colors.textoSecundario} />
          </Pressable>
        </View>
      ) : (
        campo
      )}
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
  envoltorio: { justifyContent: 'center' },
  inputPassword: { paddingRight: 46 },
  ojo: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 46, alignItems: 'center', justifyContent: 'center' },
  multiline: { minHeight: 110 },
  inputError: { borderColor: colors.peligro },
  error: { color: colors.peligro, marginTop: 4, fontSize: 12 },
});
