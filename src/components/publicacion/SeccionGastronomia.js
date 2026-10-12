import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Seccion, { estilosSeccion as s } from './Seccion';
import UbicacionMapa from './UbicacionMapa';

export default function SeccionGastronomia({ gastronomia }) {
  if (!gastronomia) return null;

  const restaurantes = gastronomia.restaurantes || [];

  return (
    <Seccion titulo="Restaurantes y comidas" icono="restaurante">
      {restaurantes.map((r, i) => (
        <View key={i} style={s.item}>
          <Text style={s.subtitulo}>{r.nombre}</Text>

          {/* Tocar la dirección abre el mapa */}
          <UbicacionMapa
            nombre={r.nombre}
            direccion={r.direccion}
            latitud={r.latitud}
            longitud={r.longitud}
          />

          {r.comentario ? (
            <Text style={[s.parrafo, styles.textoComentario]}>
              {r.comentario}
            </Text>
          ) : null}
        </View>
      ))}

      {gastronomia.reseñaGeneral ? (
        <Text style={[s.parrafo, styles.textoReseña]}>
          {gastronomia.reseñaGeneral}
        </Text>
      ) : null}
    </Seccion>
  );
}

const styles = StyleSheet.create({
  textoComentario: { marginTop: 6 },
  textoReseña: { marginTop: 12 },
});
