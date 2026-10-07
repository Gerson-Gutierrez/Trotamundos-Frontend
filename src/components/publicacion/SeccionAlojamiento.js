import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Seccion, { estilosSeccion as s } from './Seccion';
import UbicacionMapa from './UbicacionMapa';

export default function SeccionAlojamiento({ alojamiento }) {
  if (!alojamiento) return null;

  return (
    <Seccion titulo="🏨 Alojamiento">
      <Text style={s.subtitulo}>{alojamiento.nombreHostelHotel}</Text>

      {/* Tocar la dirección abre el mapa */}
      <UbicacionMapa
        nombre={alojamiento.nombreHostelHotel}
        direccion={alojamiento.direccionTextual}
        latitud={alojamiento.latitud}
        longitud={alojamiento.longitud}
      />

      {alojamiento.experiencia ? (
        <Text style={[s.parrafo, styles.textoExperiencia]}>
          {alojamiento.experiencia}
        </Text>
      ) : null}
    </Seccion>
  );
}

const styles = StyleSheet.create({
  textoExperiencia: { marginTop: 8 },
});
