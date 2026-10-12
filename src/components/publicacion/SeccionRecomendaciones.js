import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { sinProtocolo } from '../../utils/formatters';
import { avisar } from '../../utils/dialogos';
import { t } from '../../i18n';
import { TextoIcono } from '../common/Icono';
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
    <Seccion titulo="Recomendaciones y actividades" icono="recomendaciones">
      {recomendacion.contenido ? <Text style={s.parrafo}>{recomendacion.contenido}</Text> : null}

      {agencias.map((a, i) => (
        <View key={i} style={s.item}>
          {a.sitioWeb ? (
            <Pressable
              onPress={() => abrirWeb(a.sitioWeb)}
              accessibilityRole="link"
              accessibilityLabel={t('Abrir la página de {nombre}', { nombre: a.nombre })}
              style={({ pressed }) => pressed && styles.presionado}
            >
              <TextoIcono icono="agencia" color={colors.primario} style={[s.subtitulo, styles.enlace]}>{a.nombre}</TextoIcono>
              <TextoIcono icono="web" size={13} color={colors.primario} style={styles.url} numberOfLines={1}>{sinProtocolo(a.sitioWeb)}</TextoIcono>
            </Pressable>
          ) : (
            <TextoIcono icono="agencia" color={colors.primario} style={s.subtitulo}>{a.nombre}</TextoIcono>
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
