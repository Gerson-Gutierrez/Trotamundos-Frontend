import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/colors';
import { construirGlobeHtml } from './globeHtml';

/**
 * Versión web: react-native-webview no soporta web, así que se usa un iframe.
 * El HTML se escribe con document.write sobre un iframe about:blank (hereda el
 * origen real de la app). Con srcdoc o blob: el documento queda en un origen
 * opaco y los Web Workers de Cesium nunca responden: el globo se ve negro.
 *
 * Misma API que GlobeWebView.native.js
 */
const GlobeWebView = forwardRef(function GlobeWebView(
  { onPaisTocado, onPaisConfirmado, onSinPais, onListo, onError, isoInicial, style },
  ref
) {
  const iframeRef = useRef(null);
  const html = useMemo(() => construirGlobeHtml({ isoInicial }), [isoInicial]);

  const enviar = (mensaje) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(mensaje), '*');
  };

  useImperativeHandle(ref, () => ({
    seleccionarPais: (iso) => enviar({ type: 'seleccionarPais', iso }),
    limpiarSeleccion: () => enviar({ type: 'limpiarSeleccion' }),
  }));

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  useEffect(() => {
    const escuchar = (ev) => {
      if (ev.source !== iframeRef.current?.contentWindow) return;
      try {
        const msg = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        if (msg.type === 'pais') onPaisTocado?.({ iso: msg.iso, nombre: msg.nombre });
        else if (msg.type === 'paisConfirmado') onPaisConfirmado?.({ iso: msg.iso, nombre: msg.nombre });
        else if (msg.type === 'sinPais') onSinPais?.();
        else if (msg.type === 'listo') onListo?.();
        else if (msg.type === 'error') onError?.(msg.mensaje);
      } catch {}
    };
    window.addEventListener('message', escuchar);
    return () => window.removeEventListener('message', escuchar);
  }, [onPaisTocado, onPaisConfirmado, onSinPais, onListo, onError]);

  return (
    <View style={[styles.contenedor, style]}>
      <iframe
        ref={iframeRef}
        title="Globo Trotamundos"
        style={{ border: 0, width: '100%', height: '100%', background: colors.fondo }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.fondo, overflow: 'hidden' },
});

export default GlobeWebView;
