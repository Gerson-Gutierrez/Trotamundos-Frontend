import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';
import { urlImagen } from '../../utils/formatters';
import Seccion from './Seccion';

const { width: ANCHO_PANTALLA, height: ALTO_PANTALLA } = Dimensions.get('window');

export default function GaleriaImagenes({ imagenes = [] }) {
  // Guardamos el índice (posición) de la imagen seleccionada o null si el modal está cerrado
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(null);

  if (!imagenes.length) return null;

  return (
    <Seccion titulo={`📷 Imágenes`}>
      {/* Vista previa horizontal en la pantalla principal */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {imagenes.map((img, i) => (
          <Pressable key={i} onPress={() => setIndiceSeleccionado(i)}>
            <Image source={{ uri: urlImagen(img.imagenUrl) }} style={styles.miniatura} />
          </Pressable>
        ))}
      </ScrollView>

      {/* Modal tipo Carrusel / Galería deslizable */}
      <Modal
        visible={indiceSeleccionado !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setIndiceSeleccionado(null)}
      >
        <View style={styles.fondoModal}>
          {/* Botón flotante para cerrar */}
          <Pressable style={styles.botonCerrar} onPress={() => setIndiceSeleccionado(null)}>
            <Text style={styles.textoCerrar}>✕</Text>
          </Pressable>

          {/* Carrusel de imágenes */}
          <FlatList
            data={imagenes}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={indiceSeleccionado || 0}
            getItemLayout={(_, index) => ({
              length: ANCHO_PANTALLA,
              offset: ANCHO_PANTALLA * index,
              index,
            })}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.itemCarrusel}>
                <Image
                  source={{ uri: urlImagen(item.imagenUrl) }}
                  style={styles.grande}
                  resizeMode="contain"
                />
                {/* Contador de páginas */}
                <View style={styles.infoContenedor}>
                  <Text style={styles.contadorTexto}>
                    {index + 1} / {imagenes.length}
                  </Text>
                </View>
              </View>
            )}
          />

          <Text style={styles.indicadorDeslizar}>Deslizá a los lados para ver más</Text>
        </View>
      </Modal>
    </Seccion>
  );
}

const styles = StyleSheet.create({
  miniatura: { width: 140, height: 140, borderRadius: 12, marginRight: 10, backgroundColor: colors.superficieClara },
  fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  botonCerrar: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10 },
  textoCerrar: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  itemCarrusel: { width: ANCHO_PANTALLA, height: ALTO_PANTALLA * 0.8, alignItems: 'center', justifyContent: 'center' },
  grande: { width: ANCHO_PANTALLA * 0.9, height: ALTO_PANTALLA * 0.65 },
  infoContenedor: { alignItems: 'center', marginTop: 10 },
  contadorTexto: { color: colors.textoSecundario, fontSize: 12 },
  indicadorDeslizar: { color: colors.textoSecundario, textAlign: 'center', paddingBottom: 20, fontSize: 12 },
});