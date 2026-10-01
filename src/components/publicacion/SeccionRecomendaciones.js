import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { sinProtocolo } from '../../utils/formatters';
import { avisar } from '../../utils/dialogos';
import Seccion, { estilosSeccion as s } from './Seccion';

export default function SeccionRecomendaciones({ recomendacion }) {
  if (!recomendacion) return null;
  const agencias = recomendacion.agencias || [];
  if (!recomendacion.contenido && !agencias.length) return null;

  // Abre la web de la agencia en el navegador (o en la app que corresponda)
  const abrirWeb = async (url) => {
    try {
      const puede = await Linking.canOpenURL(url);
      if (!puede) return avisar('No se pudo abrir', url);
      await Linking.openURL(url);
    } catch {
      avisar('No se pudo abrir la página', url);
    }
  };

  return (
    <Seccion titulo="🧭 Recomendaciones y actividades">
      {recomendacion.contenido ? <Text style={s.parrafo}>{recomendacion.contenido}</Text> : null}

      {agencias.map((a, i) => (
        <View key={i} style={s.item}>
          {a.sitioWeb ? (
            <Pressable
              onPress={() => abrirWeb(a.sitioWeb)}
              accessibilityRole="link"
              accessibilityLabel={`Abrir la página de ${a.nombre}`}
              style={({ pressed }) => pressed && styles.presionado}
            >
              <Text style={[s.subtitulo, styles.enlace]}>🎫 {a.nombre}</Text>
              <Text style={styles.url} numberOfLines={1}>🌐 {sinProtocolo(a.sitioWeb)}</Text>
            </Pressable>
          ) : (
            <Text style={s.subtitulo}>🎫 {a.nombre}</Text>
          )}

        </View>
      ))}
    </Seccion>
  );
}

const styles = StyleSheet.create({
  enlace: { textDecorationLine: 'underline' },
  url: { color: colors.primario, fontSize: 12, marginBottom: 4 },
  presionado: { opacity: 0.6 },
});
