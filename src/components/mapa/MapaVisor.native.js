import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../constants/colors';

// Escapa texto para meterlo dentro de un <script> sin cerrar la etiqueta por accidente
const js = (valor) => JSON.stringify(valor ?? '').replace(/</g, '\\u003c');

function construirHtml(lat, lng, titulo) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#m{height:100%;margin:0;background:${colors.superficie}}</style></head>
<body><div id="m"></div><script>
  var map = L.map('m').setView([${lat}, ${lng}], 16);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
  var marcador = L.marker([${lat}, ${lng}]).addTo(map);
  var titulo = ${js(titulo)};
  if (titulo) marcador.bindPopup(titulo).openPopup();
</script></body></html>`;
}

/**
 * Mapa de solo lectura con un marcador (OpenStreetMap + Leaflet en un WebView).
 * No usa Google Maps, así que no necesita API key ni se queda en blanco dentro de un Modal.
 * Props: latitud, longitud, altura, titulo
 */
export default function MapaVisor({ latitud, longitud, altura = 350, titulo }) {
  const lat = Number(latitud);
  const lng = Number(longitud);
  const html = useMemo(() => construirHtml(lat, lng, titulo), [lat, lng, titulo]);

  return (
    <View style={[styles.contenedor, { height: altura }]}>
      <WebView
        originWhitelist={['*']}
        // baseUrl https: OpenStreetMap exige un Referer válido para servir los mosaicos
        source={{ html, baseUrl: 'https://trotamundos.app/' }}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        style={styles.web}
        containerStyle={styles.web}
      />
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
  web: { flex: 1, backgroundColor: colors.superficie },
});
