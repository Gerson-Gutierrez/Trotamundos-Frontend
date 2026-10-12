import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import MapaVisor from '../mapa/MapaVisor';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';
import Icono, { TextoIcono } from '../common/Icono';

const tieneCoordenadas = (lat, lng) =>
  lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));

/**
 * Dirección de un lugar de la publicación. Si el lugar tiene coordenadas, tocar la dirección
 * abre el mapa en una ventana. Sin coordenadas se muestra como texto simple.
 * Props: nombre, direccion, latitud, longitud
 */
export default function UbicacionMapa({ nombre, direccion, latitud, longitud }) {
  const [abierto, setAbierto] = useState(false);
  const conMapa = tieneCoordenadas(latitud, longitud);
  const texto = direccion || (conMapa ? t('Ver ubicación en el mapa') : '');

  if (!texto) return null;
  if (!conMapa) return <Text style={styles.texto}>{texto}</Text>;

  return (
    <>
      <Pressable onPress={() => setAbierto(true)} accessibilityRole="link" hitSlop={6}
        style={({ pressed }) => pressed && styles.presionado}>
        <Text style={[styles.texto, styles.enlace]}>{texto}</Text>
      </Pressable>

      <Modal visible={abierto} animationType="slide" transparent onRequestClose={() => setAbierto(false)}>
        <View style={styles.fondo}>
          <View style={styles.caja}>
            <View style={styles.cabecera}>
              <TextoIcono icono="ubicacion" color={colors.primario} size={18} style={styles.titulo} numberOfLines={1}
                contenedorStyle={styles.tituloFila}>{nombre}</TextoIcono>
              <Pressable onPress={() => setAbierto(false)} hitSlop={10} accessibilityLabel={t('Cerrar mapa')}>
                <Icono nombre="cerrar" size={22} color={colors.textoSecundario} />
              </Pressable>
            </View>
            {direccion ? <Text style={styles.direccion}>{direccion}</Text> : null}
            <MapaVisor latitud={latitud} longitud={longitud} altura={350} titulo={nombre} />
            <Pressable style={styles.volver} onPress={() => setAbierto(false)}>
              <Text style={styles.volverTexto}>{t('Cerrar y volver')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  texto: { color: colors.textoSecundario, fontSize: 13, marginBottom: 8 },
  enlace: { color: colors.primario, textDecorationLine: 'underline' },
  presionado: { opacity: 0.7 },
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  caja: { backgroundColor: colors.superficieClara, borderRadius: 16, overflow: 'hidden', padding: 16 },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tituloFila: { flex: 1, marginRight: 10 },
  titulo: { color: colors.texto, fontSize: 16, fontWeight: '700' },
  direccion: { color: colors.textoSecundario, fontSize: 12, marginBottom: 10 },
  volver: { backgroundColor: colors.primario, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  volverTexto: { color: colors.fondo, fontWeight: '800', fontSize: 14 },
});
