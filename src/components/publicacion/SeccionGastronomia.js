import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapaPicker from '../mapa/MapaPicker';
import Seccion, { estilosSeccion as s } from './Seccion';
export default function SeccionGastronomia({ gastronomia }) {
  const [restauranteSeleccionado, setRestauranteSeleccionado] = useState(null);
  if (!gastronomia) return null;
  const restaurantes = gastronomia.restaurantes || [];
  return (
    <Seccion titulo="🍽️ Restaurantes y comidas">
      {restaurantes.map((r, i) => {
        const tieneCoordenadas = r.latitud != null && r.longitud != null;
        return (
          <View key={i} style={s.item}>
            {/* Título del restaurante */}
            <Text style={s.subtitulo}>{r.nombre}</Text>
            {/* Dirección e icono de mapa (Arriba) */}
            {r.direccion ? (
              <View style={styles.contenedorDireccion}>
                <Text style={[s.secundario, styles.textoDireccion]}>
                  {r.direccion}
                </Text>
                {tieneCoordenadas ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconoBoton,
                      pressed && styles.iconoPresionado,
                    ]}
                    onPress={() => setRestauranteSeleccionado(r)}
                    hitSlop={8}
                  >
                    <Ionicons name="location-sharp" size={18} color="#d25f07e2" />
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {/* Comentario u opinión individual si la hubiera (Abajo) */}
            {r.comentario ? (
              <Text style={[s.parrafo, styles.textoComentario]}>
                {r.comentario}
              </Text>
            ) : null}
          </View>
        );
      })}
      {/* Reseña general escrita por el usuario al final (Abajo) */}
      {gastronomia.reseñaGeneral ? (
        <Text style={[s.parrafo, styles.textoReseña]}>
          {gastronomia.reseñaGeneral}
        </Text>
      ) : null}
      {/* Modal dinámico para el mapa */}
      <Modal
        visible={!!restauranteSeleccionado}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRestauranteSeleccionado(null)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.contenedorMapa}>
            <View style={styles.cabeceraModal}>
              <Text style={styles.tituloModal} numberOfLines={1}>
                📍 {restauranteSeleccionado?.nombre}
              </Text>
              <Pressable
                style={styles.botonCerrar}
                onPress={() => setRestauranteSeleccionado(null)}
              >
                <Text style={styles.textoCerrar}>✕</Text>
              </Pressable>
            </View>
            {restauranteSeleccionado ? (
              <MapaPicker
                latitud={restauranteSeleccionado.latitud}
                longitud={restauranteSeleccionado.longitud}
                editable={false}
                altura={350}
                titulo={restauranteSeleccionado.nombre}
              />
            ) : null}
            <Pressable
              style={styles.botonVolver}
              onPress={() => setRestauranteSeleccionado(null)}
            >
              <Text style={styles.textoVolver}>Cerrar y volver</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Seccion>
  );
}
const styles = StyleSheet.create({
  contenedorDireccion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 8,
  },
  textoDireccion: {
    flex: 1,
    marginBottom: 0,
  },
  iconoBoton: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoPresionado: {
    transform: [{ scale: 0.9 }],
    opacity: 0.8,
  },
  textoComentario: {
    marginTop: 6,
  },
  textoReseña: {
    marginTop: 12,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  contenedorMapa: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  cabeceraModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tituloModal: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
    color: '#e3e7ed',
  },
  botonCerrar: {
    padding: 4,
  },
  textoCerrar: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  botonVolver: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  textoVolver: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});