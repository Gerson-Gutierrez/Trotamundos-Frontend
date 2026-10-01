import { Alert, Platform } from 'react-native';

// Alert.alert no funciona en web: estos helpers usan window.confirm / alert allí.
export function confirmar(titulo, mensaje, { textoOk = 'Aceptar', destructivo = false } = {}) {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(window.confirm(`${titulo}\n\n${mensaje}`));
      return;
    }
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: textoOk, style: destructivo ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
}

export function avisar(titulo, mensaje = '') {
  if (Platform.OS === 'web') {
    window.alert(mensaje ? `${titulo}\n\n${mensaje}` : titulo);
    return;
  }
  Alert.alert(titulo, mensaje);
}
