import React, { useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';
import { urlImagen } from '../../utils/formatters';
import Icono from '../common/Icono';

const ESPACIO = 4;

/**
 * Collage de fotos de la publicación:
 *  - 1 foto: se muestra sola.
 *  - 2 fotos: se muestra la primera con la marca "Ver todo"; al tocarla se abre el carrusel con ambas.
 *  - 3 fotos: una grande vertical a la izquierda y dos horizontales apiladas a la derecha.
 *  - más de 3: igual que con 3, con la marca "Ver todo (+N)" sobre la tercera.
 * Tocar cualquier foto abre el carrusel a pantalla completa en esa posición.
 */
export default function GaleriaImagenes({ imagenes = [] }) {
  // Índice de la foto abierta en el carrusel, o null si está cerrado
  const [abierta, setAbierta] = useState(null);

  if (!imagenes.length) return null;

  const total = imagenes.length;
  const uri = (i) => urlImagen(imagenes[i].imagenUrl);
  const restantes = total - 3;

  return (
    <View style={styles.contenedor}>
      {total === 1 && <Foto uri={uri(0)} onPress={() => setAbierta(0)} style={styles.una} />}

      {total === 2 && (
        <Foto uri={uri(0)} onPress={() => setAbierta(0)} style={styles.una}
          marca={<MarcaVerTodo texto={t('Ver todo')} />} />
      )}

      {total >= 3 && (
        <View style={styles.collage}>
          <Foto uri={uri(0)} onPress={() => setAbierta(0)} style={styles.vertical} />
          <View style={styles.columna}>
            <Foto uri={uri(1)} onPress={() => setAbierta(1)} style={styles.horizontal} />
            <Foto uri={uri(2)} onPress={() => setAbierta(2)} style={styles.horizontal}
              marca={total > 3 ? <MarcaVerTodo texto={t('Ver todo')} extra={`+${restantes}`} /> : null} />
          </View>
        </View>
      )}

      <Carrusel imagenes={imagenes} indice={abierta} onCerrar={() => setAbierta(null)} />
    </View>
  );
}

function Foto({ uri, onPress, style, marca }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [style, pressed && styles.presionada]}>
      <Image source={{ uri }} style={styles.imagen} resizeMode="cover" />
      {marca}
    </Pressable>
  );
}

// Marca de agua sobre la foto que invita a abrir todas las imágenes
function MarcaVerTodo({ texto, extra }) {
  return (
    <View style={styles.marca} pointerEvents="none">
      <Icono nombre="verTodo" size={26} color={colors.blanco} />
      <Text style={styles.marcaTexto}>{texto}</Text>
      {extra ? <Text style={styles.marcaExtra}>{extra}</Text> : null}
    </View>
  );
}

function Carrusel({ imagenes, indice, onCerrar }) {
  const { width, height } = useWindowDimensions();
  const [actual, setActual] = useState(0);
  const visible = indice !== null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}
      onShow={() => setActual(indice || 0)}>
      <View style={styles.fondoModal}>
        {visible && (
          <FlatList
            data={imagenes}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={indice || 0}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) => setActual(Math.round(e.nativeEvent.contentOffset.x / width))}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: urlImagen(item.imagenUrl) }}
                  style={{ width, height: height * 0.75 }} resizeMode="contain" />
              </View>
            )}
          />
        )}

        <Pressable style={styles.cerrar} onPress={onCerrar} hitSlop={12} accessibilityLabel={t('Cerrar')}>
          <Icono nombre="cerrar" size={26} color={colors.blanco} />
        </Pressable>

        <View style={styles.pie} pointerEvents="none">
          <Text style={styles.contador}>{actual + 1} / {imagenes.length}</Text>
          {imagenes.length > 1 ? <Text style={styles.pista}>{t('Deslizá a los lados para ver más')}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  una: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.superficieClara },
  collage: { flexDirection: 'row', gap: ESPACIO, aspectRatio: 4 / 3 },
  vertical: { flex: 1, backgroundColor: colors.superficieClara },
  columna: { flex: 1, gap: ESPACIO },
  horizontal: { flex: 1, backgroundColor: colors.superficieClara },
  imagen: { width: '100%', height: '100%' },
  presionada: { opacity: 0.85 },
  marca: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  marcaTexto: { color: colors.blanco, fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  marcaExtra: { color: colors.blanco, fontSize: 20, fontWeight: '900' },
  fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.96)', justifyContent: 'center' },
  cerrar: { position: 'absolute', top: 44, right: 18, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  pie: { position: 'absolute', bottom: 36, left: 0, right: 0, alignItems: 'center', gap: 4 },
  contador: { color: colors.blanco, fontSize: 14, fontWeight: '700' },
  pista: { color: colors.textoSecundario, fontSize: 12 },
});
