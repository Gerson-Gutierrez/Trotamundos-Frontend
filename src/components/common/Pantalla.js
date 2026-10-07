import React from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

// Contenedor base de todas las pantallas: fondo, safe area y scroll opcional.
export default function Pantalla({ children, scroll = true, style, contenidoStyle, bordes = ['top'] }) {
  const Contenido = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={bordes}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <Contenido
          style={[styles.flex, style]}
          contentContainerStyle={scroll ? [styles.contenido, contenidoStyle] : undefined}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </Contenido>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  flex: { flex: 1 },
  contenido: { padding: 20, paddingBottom: 60, width: '100%', maxWidth: 720, alignSelf: 'center' },
});
