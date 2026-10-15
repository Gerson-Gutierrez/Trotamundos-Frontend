import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

// Un único juego de iconos vectoriales (Material Design) para toda la app, en lugar de emojis.
// Se usan nombres con significado ("alojamiento") y no el nombre técnico del icono.
const ICONOS = {
  alojamiento: 'bed-outline',
  restaurante: 'silverware-fork-knife',
  recomendaciones: 'compass-outline',
  agencia: 'ticket-confirmation-outline',
  imagenes: 'image-multiple-outline',
  camara: 'camera-outline',
  ubicacion: 'map-marker-outline',
  lugar: 'map-marker-star-outline',
  direccion: 'map-marker-outline',
  gps: 'crosshairs-gps',
  web: 'web',
  buscar: 'magnify',
  etiqueta: 'tag-outline',
  mundo: 'earth',
  idioma: 'translate',
  cerrar: 'close',
  mas: 'plus',
  denuncia: 'flag-outline',
  usuarios: 'account-group-outline',
  admin: 'shield-check-outline',
  superadmin: 'crown-outline',
  correo: 'email-outline',
  bloqueado: 'cancel',
  publicar: 'rocket-launch-outline',
  favorito: 'bookmark-outline',
  favoritoLleno: 'bookmark',
  instagram: 'instagram',
  verTodo: 'image-multiple',
  siguiente: 'chevron-right',
  check: 'check',
  verPassword: 'eye-outline',
  ocultarPassword: 'eye-off-outline',
};

export default function Icono({ nombre, size = 18, color = colors.textoSecundario, style }) {
  return <MaterialCommunityIcons name={ICONOS[nombre] || nombre} size={size} color={color} style={style} />;
}

// Texto precedido por un icono, en una sola línea (reemplaza a los emojis dentro de los textos)
export function TextoIcono({ icono, children, style, color, size = 16, numberOfLines, gap = 6, contenedorStyle }) {
  const estilo = StyleSheet.flatten(style) || {};
  const colorIcono = color || estilo.color || colors.texto;
  return (
    <View style={[styles.fila, { gap }, contenedorStyle]}>
      <Icono nombre={icono} size={size} color={colorIcono} />
      <Text style={[style, styles.texto]} numberOfLines={numberOfLines}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  texto: { flexShrink: 1 },
});
