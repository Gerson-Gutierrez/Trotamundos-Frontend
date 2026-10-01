import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/colors';

// Versión web: Leaflet dentro de un iframe (react-native-maps no corre en web).
function html(lat, lng, editable, titulo) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#m{height:100%;margin:0;background:${colors.superficie}}</style></head>
<body><div id="m"></div><script>
  var lat = ${lat ?? 'null'}, lng = ${lng ?? 'null'}, editable = ${editable ? 'true' : 'false'};
  var map = L.map('m', { zoomControl: true }).setView([lat ?? -34.6, lng ?? -58.4], lat != null ? 15 : 3);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
  var marker = null;
  function poner(la, ln, mover) {
    if (marker) marker.setLatLng([la, ln]); else {
      marker = L.marker([la, ln], { draggable: editable }).addTo(map);
      if (${JSON.stringify(titulo || '')}) marker.bindPopup(${JSON.stringify(titulo || '')});
      marker.on('dragend', function () { var p = marker.getLatLng(); enviar(p.lat, p.lng); });
    }
    if (mover) map.setView([la, ln], Math.max(map.getZoom(), 15));
  }
  function enviar(la, ln) { window.parent.postMessage(JSON.stringify({ type: 'ubicacion', latitud: la, longitud: ln }), '*'); }
  if (lat != null) poner(lat, lng, false);
  if (editable) map.on('click', function (e) { poner(e.latlng.lat, e.latlng.lng, false); enviar(e.latlng.lat, e.latlng.lng); });
  window.addEventListener('message', function (ev) {
    try { var d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
      if (d && d.type === 'setUbicacion') poner(d.latitud, d.longitud, true); } catch (_) {}
  });
</script></body></html>`;
}

export default function MapaPicker({ latitud, longitud, onCambio, editable = true, altura = 260, titulo }) {
  const iframeRef = useRef(null);
  // El HTML se genera una sola vez; los cambios posteriores se mandan por postMessage
  const srcDoc = useMemo(() => html(latitud, longitud, editable, titulo), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (latitud == null || longitud == null) return;
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ type: 'setUbicacion', latitud: Number(latitud), longitud: Number(longitud) }), '*');
  }, [latitud, longitud]);

  useEffect(() => {
    const escuchar = (ev) => {
      if (ev.source !== iframeRef.current?.contentWindow) return;
      try {
        const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        if (d?.type === 'ubicacion') onCambio?.({ latitud: d.latitud, longitud: d.longitud });
      } catch {}
    };
    window.addEventListener('message', escuchar);
    return () => window.removeEventListener('message', escuchar);
  }, [onCambio]);

  return (
    <View style={[styles.contenedor, { height: altura }]}>
      <iframe ref={iframeRef} title="Mapa" srcDoc={srcDoc} sandbox="allow-scripts allow-same-origin"
        style={{ border: 0, width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.borde, backgroundColor: colors.superficie },
});
