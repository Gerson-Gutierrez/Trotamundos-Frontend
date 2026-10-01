import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapaPicker from '../mapa/MapaPicker';
import Seccion, { estilosSeccion as s } from './Seccion';

export default function SeccionAlojamiento({ alojamiento }) {
  const [mostrarMapa, setMostrarMapa] = useState(false);

  if (!alojamiento) return null;

  const tieneCoordenadas = alojamiento.latitud && alojamiento.longitud;

  return (
    <Seccion titulo="🏨 Alojamiento">
      {/* 1. Título e información del alojamiento */}
      <Text style={s.subtitulo}>{alojamiento.nombreHostelHotel}</Text>

      {/* 2. Dirección y mapa (Arriba) */}
      {alojamiento.direccionTextual ? (
        <View style={styles.contenedorDireccion}>
          <Text style={[s.secundario, styles.textoDireccion]}>
            {alojamiento.direccionTextual}
          </Text>

          {tieneCoordenadas ? (
            <Pressable
              style={({ pressed }) => [
                styles.iconoBoton,
                pressed && styles.iconoPresionado,
              ]}
              onPress={() => setMostrarMapa(true)}
              hitSlop={8}
            >
              <Ionicons name="location-sharp" size={18} color="#d25f07e2" />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* 3. Comentario / Experiencia del usuario (Abajo) */}
      {alojamiento.experiencia ? (
        <Text style={[s.parrafo, styles.textoExperiencia]}>
          {alojamiento.experiencia}
        </Text>
      ) : null}

      {/* Modal del Mapa */}
      <Modal
        visible={mostrarMapa}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMostrarMapa(false)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.contenedorMapa}>
            <View style={styles.cabeceraModal}>
              <Text style={styles.tituloModal} numberOfLines={1}>
                📍 {alojamiento.nombreHostelHotel}
              </Text>
              <Pressable
                style={styles.botonCerrar}
                onPress={() => setMostrarMapa(false)}
              >
                <Text style={styles.textoCerrar}>✕</Text>
              </Pressable>
            </View>

            <MapaPicker
              latitud={alojamiento.latitud}
              longitud={alojamiento.longitud}
              editable={false}
              altura={350}
              titulo={alojamiento.nombreHostelHotel}
            />

            <Pressable
              style={styles.botonVolver}
              onPress={() => setMostrarMapa(false)}
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
  },
  textoDireccion: {
    marginRight: 6,
  },
  iconoBoton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoPresionado: {
    transform: [{ scale: 0.9 }],
    opacity: 0.8,
  },
  textoExperiencia: {
    marginTop: 8,
  
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
    color:'#e3e7ed',
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