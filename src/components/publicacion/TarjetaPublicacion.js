import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatearFecha, iniciales, urlImagen } from '../../utils/formatters';

// Resumen de una publicación para el listado del inicio y del perfil.
export default function TarjetaPublicacion({ publicacion, onPress }) {
  const p = publicacion;
  const resumen =
    p.recomendacion?.contenido ||
    p.alojamiento?.experiencia ||
    p.experienciaGastronomica?.reseñaGeneral ||
    '';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}>
      <View style={styles.cuerpo}>
        <Text style={styles.lugar} numberOfLines={1}>
          📍 {p.nombreCiudad}, {p.nombrePais}
        </Text>

        <View style={styles.etiquetas}>
          {p.alojamiento && <Etiqueta texto="🏨 Alojamiento" />}
          {p.experienciaGastronomica && <Etiqueta texto="🍽️ Comidas" />}
          {(p.recomendacion?.contenido || p.recomendacion?.agencias?.length > 0) && <Etiqueta texto="🧭 Recomendaciones" />}
          {p.recomendacion?.agencias?.length > 0 && <Etiqueta texto={`🎫 ${p.recomendacion.agencias.length}`} />}
          {p.imagenes?.length > 0 && <Etiqueta texto={`📷 ${p.imagenes.length}`} />}
        </View>

        {resumen ? <Text style={styles.resumen} numberOfLines={2}>{resumen}</Text> : null}

        <View style={styles.autor}>
          {p.fotoPerfilUrl ? (
            <Image source={{ uri: urlImagen(p.fotoPerfilUrl) }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarTexto]}>
              <Text style={styles.avatarIniciales}>{iniciales(p.nombreUsuario)}</Text>
            </View>
          )}
          <Text style={styles.autorNombre} numberOfLines={1}>{p.nombreUsuario}</Text>
          <Text style={styles.fecha}>{formatearFecha(p.fechaPublicacion)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function Etiqueta({ texto }) {
  return (
    <View style={styles.etiqueta}>
      <Text style={styles.etiquetaTexto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.superficie,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  presionada: { opacity: 0.85 },
  cuerpo: { padding: 14 },
  lugar: { color: colors.primario, fontWeight: '700', fontSize: 15, marginBottom: 8 },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  etiqueta: { backgroundColor: colors.superficieClara, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  etiquetaTexto: { color: colors.textoSecundario, fontSize: 12 },
  resumen: { color: colors.texto, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  autor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.superficieClara },
  avatarTexto: { alignItems: 'center', justifyContent: 'center' },
  avatarIniciales: { color: colors.primario, fontSize: 11, fontWeight: '700' },
  autorNombre: { color: colors.textoSecundario, fontSize: 13, flex: 1 },
  fecha: { color: colors.textoSecundario, fontSize: 12 },
});