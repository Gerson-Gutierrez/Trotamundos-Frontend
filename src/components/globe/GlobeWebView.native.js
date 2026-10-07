import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../constants/colors';
import { construirGlobeHtml } from './globeHtml';

/**
 * Globo 3D (Cesium) dentro de un WebView. Cesium es WebGL puro, por eso
 * en nativo se embebe como página web.
 *
 * Props:
 *   onPaisTocado({ iso, nombre })      un toque: solo muestra el país
 *   onPaisConfirmado({ iso, nombre })  doble toque: aplicar el filtro
 *   onSinPais()                        toque en el océano
 *   onListo(), onError(mensaje), isoInicial
 * Ref: seleccionarPais(iso), limpiarSeleccion()
 */
const GlobeWebView = forwardRef(function GlobeWebView(
  { onPaisTocado, onPaisConfirmado, onSinPais, onListo, onError, isoInicial, style },
  ref
) {
  const webRef = useRef(null);
  const html = useMemo(() => construirGlobeHtml({ isoInicial }), [isoInicial]);

  useImperativeHandle(ref, () => ({
    seleccionarPais: (iso) => {
      webRef.current?.injectJavaScript(
        `window.seleccionarPais && window.seleccionarPais(${JSON.stringify(iso)}); true;`
      );
    },
    limpiarSeleccion: () => {
      webRef.current?.injectJavaScript('window.limpiarSeleccion && window.limpiarSeleccion(); true;');
    },
  }));

  const manejarMensaje = (evento) => {
    try {
      const msg = JSON.parse(evento.nativeEvent.data);
      if (msg.type === 'pais') onPaisTocado?.({ iso: msg.iso, nombre: msg.nombre });
      else if (msg.type === 'paisConfirmado') onPaisConfirmado?.({ iso: msg.iso, nombre: msg.nombre });
      else if (msg.type === 'sinPais') onSinPais?.();
      else if (msg.type === 'listo') onListo?.();
      else if (msg.type === 'error') onError?.(msg.mensaje);
    } catch {}
  };

  return (
    <WebView
      ref={webRef}
      originWhitelist={['*']}
      // baseUrl https para que el WebView permita cargar Cesium y el GeoJSON desde CDN
      source={{ html, baseUrl: 'https://trotamundos.app/' }}
      onMessage={manejarMensaje}
      javaScriptEnabled
      domStorageEnabled
      mixedContentMode="always"
      allowsInlineMediaPlayback
      setSupportMultipleWindows={false}
      style={[styles.web, style]}
      containerStyle={styles.web}
    />
  );
});

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: colors.fondo },
});

export default GlobeWebView;
