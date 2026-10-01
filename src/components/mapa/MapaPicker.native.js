import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../../constants/colors';

const REGION_POR_DEFECTO = { latitude: -34.6037, longitude: -58.3816, latitudeDelta: 40, longitudeDelta: 40 };

/**
 * Mapa con un marcador. Si `editable`, tocar el mapa o arrastrar el pin mueve la ubicación.
 * Props: latitud, longitud, onCambio({ latitud, longitud }), editable, altura, titulo
 */
export default function MapaPicker({ latitud, longitud, onCambio, editable = true, altura = 260, titulo }) {
  const mapRef = useRef(null);
  const tieneUbicacion = latitud != null && longitud != null;

  // Centra el mapa cada vez que cambia la ubicación (p. ej. tras geocodificar)
  useEffect(() => {
    if (!tieneUbicacion) return;
    mapRef.current?.animateToRegion(
      { latitude: Number(latitud), longitude: Number(longitud), latitudeDelta: 0.02, longitudeDelta: 0.02 },
      500
    );
  }, [latitud, longitud, tieneUbicacion]);

  const manejarPress = (e) => {
    if (!editable) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    onCambio?.({ latitud: latitude, longitud: longitude });
  };

  return (
    <View style={[styles.contenedor, { height: altura }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={
          tieneUbicacion
            ? { latitude: Number(latitud), longitude: Number(longitud), latitudeDelta: 0.02, longitudeDelta: 0.02 }
            : REGION_POR_DEFECTO
        }
        onPress={manejarPress}
        userInterfaceStyle="dark"
      >
        {tieneUbicacion && (
          <Marker
            coordinate={{ latitude: Number(latitud), longitude: Number(longitud) }}
            title={titulo}
            draggable={editable}
            onDragEnd={manejarPress}
            pinColor={colors.primario}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borde,
    backgroundColor: colors.superficie,
  },
});
