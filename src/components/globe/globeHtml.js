
import { CESIUM_ION_TOKEN } from '../../constants/config';
import { colors } from '../../constants/colors';

// jsDelivr sirve los archivos sin redirecciones: cesium.com/downloads redirige y los Web Workers
// de Cesium (terreno) no pueden seguir redirecciones cross-origin, con lo que el globo nunca aparece.
const CESIUM_BASE = 'https://cdn.jsdelivr.net/npm/cesium@1.122.0/Build/Cesium';
// Fronteras de países (Natural Earth 50m, ~3 MB). El dataset de 110m es demasiado grueso:
// ciudades costeras como Montevideo o Estambul quedaban fuera de todo país.
const GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson';

/**
 * Genera el HTML del globo 3D.
 *
 * Detección del país: NO se usa scene.pick() sobre polígonos de Cesium (construir
 * los 288 países como geometría es lentísimo y deja el globo sin responder). En su
 * lugar se proyecta el clic sobre el elipsoide para obtener lat/lon y se resuelve
 * el país con un punto-en-polígono sobre el GeoJSON crudo: instantáneo y confiable.
 *
 * Los nombres de los países se dibujan sobre el globo (más detalle al acercarse).
 *
 * Mensajes globo -> app:
 *   { type: 'listo' }                          fronteras cargadas
 *   { type: 'pais', iso, nombre }              un toque: mostrar el nombre
 *   { type: 'paisConfirmado', iso, nombre }    doble toque: aplicar el filtro
 *   { type: 'sinPais' }                        toque en el océano
 *   { type: 'error', mensaje }
 * Mensajes app -> globo:
 *   window.seleccionarPais(iso)  |  postMessage({ type:'seleccionarPais', iso })
 */
export function construirGlobeHtml({ isoInicial = '', modoSeleccion = false } = {}) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<script>
  window.CESIUM_BASE_URL = '${CESIUM_BASE}/';
  window.__errores = [];
  window.addEventListener('error', function (e) { window.__errores.push(String(e.message)); });
  window.addEventListener('unhandledrejection', function (e) { window.__errores.push('promise: ' + (e.reason && e.reason.message || e.reason)); });
</script>
<script src="${CESIUM_BASE}/Cesium.js"></script>
<link href="${CESIUM_BASE}/Widgets/widgets.css" rel="stylesheet">
<style>
  html, body, #globo { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: ${colors.fondo}; }
  #creditos { display: none; }
  #estado {
    position: absolute; top: 8px; left: 8px; right: 8px; padding: 6px; text-align: center;
    font: 13px system-ui, sans-serif; color: ${colors.textoSecundario}; pointer-events: none;
  }
  #etiqueta {
    position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%);
    max-width: 90%; padding: 8px 14px; border-radius: 18px; pointer-events: none;
    background: rgba(17,24,39,0.92); border: 1px solid ${colors.primario};
    color: ${colors.texto}; font: 600 14px system-ui, sans-serif; text-align: center;
    opacity: 0; transition: opacity .15s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  #etiqueta.visible { opacity: 1; }
  #etiqueta small { display: block; color: ${colors.textoSecundario}; font-weight: 400; font-size: 11px; }
  .cesium-viewer-bottom { display: none !important; }
</style>
</head>
<body>
<div id="globo"></div>
<div id="creditos"></div>
<div id="estado">Cargando globo…</div>
<div id="etiqueta"></div>
<script>
(function () {
  var TOKEN = ${JSON.stringify(CESIUM_ION_TOKEN)};
  var ISO_INICIAL = ${JSON.stringify(isoInicial)};
  var GEOJSON = ${JSON.stringify(GEOJSON_URL)};
  // En el inicio el doble toque filtra las publicaciones; en el wizard solo elige el país
  var AYUDA_TOCAR = ${JSON.stringify(modoSeleccion ? 'Tocá dos veces para elegirlo' : 'Tocá dos veces para ver sus publicaciones')};
  var AYUDA_ELEGIDO = ${JSON.stringify(modoSeleccion ? 'País elegido' : 'Mostrando sus publicaciones')};
  var COLOR_BORDE = Cesium.Color.fromCssColorString('${colors.primario}').withAlpha(0.55);
  var COLOR_SELECCION = Cesium.Color.fromCssColorString('${colors.primario}');
  var estado = document.getElementById('estado');
  var etiqueta = document.getElementById('etiqueta');

  function enviar(msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  }

  function mostrarEtiqueta(texto, ayuda) {
    etiqueta.innerHTML = texto ? texto + (ayuda ? '<small>' + ayuda + '<\\/small>' : '') : '';
    etiqueta.classList.toggle('visible', !!texto);
  }

  // ---------- Viewer ----------
  var viewer;
  try {
    if (TOKEN) Cesium.Ion.defaultAccessToken = TOKEN;
    var opciones = {
      animation: false, timeline: false, baseLayerPicker: false, geocoder: false, homeButton: false,
      sceneModePicker: false, navigationHelpButton: false, fullscreenButton: false, infoBox: false,
      selectionIndicator: false, creditContainer: 'creditos', targetFrameRate: 30,
    };
    if (!TOKEN) {
      // Sin Cesium Ion: imagen Natural Earth II incluida en el build de Cesium (no requiere token)
      opciones.baseLayer = Cesium.ImageryLayer.fromProviderAsync(
        Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'))
      );
    }
    viewer = new Cesium.Viewer('globo', opciones);
    window.__viewer = viewer;
  } catch (e) {
    estado.textContent = 'No se pudo iniciar el globo: ' + e.message;
    enviar({ type: 'error', mensaje: e.message });
    return;
  }

  viewer.scene.globe.enableLighting = false;
  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('${colors.superficie}');
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 400000;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 40000000;
  viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(-60, -10, 25000000) });

  // ---------- Datos de países ----------
  var paises = [];   // { iso, nombre, poligonos: [[anilloExterior, ...huecos]], bbox }

  function isoDe(p) {
    var claves = ['ISO_A2_EH', 'ISO_A2', 'iso_a2', 'WB_A2'];
    for (var i = 0; i < claves.length; i++) {
      var v = p[claves[i]];
      if (v && v !== '-99') return String(v).toUpperCase();
    }
    return null;
  }
  function nombreDe(p) {
    return p.NAME_ES || p.NAME_LONG || p.NAME || p.ADMIN || '';
  }

  function bboxDe(poligonos) {
    var minX = 180, minY = 90, maxX = -180, maxY = -90;
    for (var a = 0; a < poligonos.length; a++) {
      var anillo = poligonos[a][0];
      for (var i = 0; i < anillo.length; i++) {
        var x = anillo[i][0], y = anillo[i][1];
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    return [minX, minY, maxX, maxY];
  }

  // Área aproximada (fórmula del área de Gauss) para desempatar enclaves:
  // si un punto cae dentro de dos países (Lesoto dentro de Sudáfrica), gana el más chico.
  function areaDe(poligonos) {
    var total = 0;
    for (var a = 0; a < poligonos.length; a++) {
      var anillo = poligonos[a][0], suma = 0;
      for (var i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
        suma += (anillo[j][0] + anillo[i][0]) * (anillo[j][1] - anillo[i][1]);
      }
      total += Math.abs(suma / 2);
    }
    return total;
  }

  // Punto en anillo por lanzamiento de rayos
  function enAnillo(anillo, lon, lat) {
    var dentro = false;
    for (var i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      var xi = anillo[i][0], yi = anillo[i][1], xj = anillo[j][0], yj = anillo[j][1];
      if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) dentro = !dentro;
    }
    return dentro;
  }
  function enPoligono(poligono, lon, lat) {
    if (!enAnillo(poligono[0], lon, lat)) return false;
    for (var h = 1; h < poligono.length; h++) if (enAnillo(poligono[h], lon, lat)) return false; // huecos
    return true;
  }

  // Distancia del punto al segmento, en grados corregidos por la latitud
  // (un grado de longitud se acorta al alejarse del ecuador).
  function distanciaASegmento(lon, lat, x1, y1, x2, y2, escalaLon) {
    var dx = (x2 - x1) * escalaLon, dy = y2 - y1;
    var px = (lon - x1) * escalaLon, py = lat - y1;
    var largo = dx * dx + dy * dy;
    var t = largo > 0 ? Math.max(0, Math.min(1, (px * dx + py * dy) / largo)) : 0;
    var ex = px - t * dx, ey = py - t * dy;
    return Math.sqrt(ex * ex + ey * ey);
  }
  function distanciaAPais(pais, lon, lat, corte) {
    var escalaLon = Math.cos(lat * Math.PI / 180);
    var minima = Infinity;
    for (var a = 0; a < pais.poligonos.length; a++) {
      var anillo = pais.poligonos[a][0];
      for (var i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
        var d = distanciaASegmento(lon, lat, anillo[j][0], anillo[j][1], anillo[i][0], anillo[i][1], escalaLon);
        if (d < minima) { minima = d; if (minima > corte) continue; }
      }
    }
    return minima;
  }

  /**
   * País en unas coordenadas.
   * 1) Si el punto cae dentro de uno o más países, gana el de menor área (enclaves).
   * 2) Si no cae en ninguno (pasa seguido en costas y ríos: las fronteras del mapa
   *    están simplificadas), se toma el país más cercano dentro de la tolerancia (en grados).
   *    Sin esto, tocar Montevideo o Estambul no devolvía nada.
   */
  function paisEn(lon, lat, tolerancia) {
    var elegido = null;
    for (var i = 0; i < paises.length; i++) {
      var p = paises[i], b = p.bbox;
      if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue;
      for (var j = 0; j < p.poligonos.length; j++) {
        if (enPoligono(p.poligonos[j], lon, lat)) {
          if (!elegido || p.area < elegido.area) elegido = p;
          break;
        }
      }
    }
    if (elegido) return elegido;

    var tol = tolerancia || 0;
    if (tol <= 0) return null;

    var cercano = null, mejor = tol;
    for (var k = 0; k < paises.length; k++) {
      var q = paises[k], c = q.bbox;
      if (lon < c[0] - tol || lon > c[2] + tol || lat < c[1] - tol || lat > c[3] + tol) continue;
      var d = distanciaAPais(q, lon, lat, mejor);
      if (d < mejor) { mejor = d; cercano = q; }
    }
    return cercano;
  }
  function paisPorIso(codigo) {
    if (!codigo) return null;
    codigo = String(codigo).toUpperCase();
    for (var i = 0; i < paises.length; i++) if (paises[i].iso === codigo) return paises[i];
    return null;
  }

  // ---------- Fronteras (polilíneas: mucho más livianas que polígonos) ----------
  var lineas = new Cesium.PolylineCollection();
  viewer.scene.primitives.add(lineas);

  function aCartesianos(anillo) {
    var plano = [];
    for (var i = 0; i < anillo.length; i++) { plano.push(anillo[i][0], anillo[i][1]); }
    return Cesium.Cartesian3.fromDegreesArray(plano);
  }

  function dibujarFronteras() {
    var material = Cesium.Material.fromType('Color', { color: COLOR_BORDE });
    for (var i = 0; i < paises.length; i++) {
      var polys = paises[i].poligonos;
      for (var j = 0; j < polys.length; j++) {
        var pos = aCartesianos(polys[j][0]);
        if (pos.length > 1) lineas.add({ positions: pos, width: 1, material: material });
      }
    }
  }

  // ---------- Nombres de los países ----------
  // Los países importantes (LABELRANK bajo) se ven desde lejos; los chicos aparecen al acercarse.
  var nombres = new Cesium.LabelCollection();
  viewer.scene.primitives.add(nombres);
  var etiquetasPaises = []; // { label, normal }

  function distanciaMaximaPorRango(rango) {
    if (rango <= 2) return Number.POSITIVE_INFINITY;
    if (rango === 3) return 18000000;
    if (rango === 4) return 10000000;
    if (rango === 5) return 6000000;
    return 3500000;
  }

  function dibujarNombres() {
    for (var i = 0; i < paises.length; i++) {
      var p = paises[i];
      if (!p.nombre || p.etiquetaLon == null) continue;
      var pos = Cesium.Cartesian3.fromDegrees(p.etiquetaLon, p.etiquetaLat, 30000);
      var label = nombres.add({
        position: pos,
        text: p.nombre,
        font: '600 13px system-ui, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        scaleByDistance: new Cesium.NearFarScalar(1500000, 1.1, 30000000, 0.75),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, distanciaMaximaPorRango(p.rango)),
      });
      etiquetasPaises.push({ label: label, normal: Cesium.Cartesian3.normalize(pos, new Cesium.Cartesian3()) });
    }
  }

  // Oculta los nombres del lado de atrás del globo (las etiquetas no se tapan solas con la Tierra)
  var direccionCamara = new Cesium.Cartesian3();
  viewer.scene.preRender.addEventListener(function () {
    if (!etiquetasPaises.length) return;
    var cam = viewer.camera.positionWC;
    var distancia = Cesium.Cartesian3.magnitude(cam);
    Cesium.Cartesian3.normalize(cam, direccionCamara);
    // Coseno del ángulo hasta el horizonte visto desde la cámara, con un pequeño margen
    var horizonte = Cesium.Ellipsoid.WGS84.maximumRadius / distancia + 0.03;
    for (var i = 0; i < etiquetasPaises.length; i++) {
      var e = etiquetasPaises[i];
      e.label.show = Cesium.Cartesian3.dot(e.normal, direccionCamara) > horizonte;
    }
  });

  // Centroide del polígono más grande: posición de respaldo si el GeoJSON no trae LABEL_X/LABEL_Y
  function centroDe(poligonos) {
    var mayor = null, mayorArea = -1;
    for (var a = 0; a < poligonos.length; a++) {
      var area = areaDe([poligonos[a]]);
      if (area > mayorArea) { mayorArea = area; mayor = poligonos[a][0]; }
    }
    if (!mayor || !mayor.length) return null;
    var sx = 0, sy = 0;
    for (var i = 0; i < mayor.length; i++) { sx += mayor[i][0]; sy += mayor[i][1]; }
    return [sx / mayor.length, sy / mayor.length];
  }

  // ---------- Resaltado del país elegido ----------
  var resaltado = null;
  function resaltar(pais) {
    if (resaltado) { viewer.scene.primitives.remove(resaltado); resaltado = null; }
    if (!pais) { viewer.scene.requestRender(); return; }
    resaltado = new Cesium.PolylineCollection();
    var material = Cesium.Material.fromType('Color', { color: COLOR_SELECCION });
    for (var j = 0; j < pais.poligonos.length; j++) {
      var pos = aCartesianos(pais.poligonos[j][0]);
      if (pos.length > 1) resaltado.add({ positions: pos, width: 4, material: material });
    }
    viewer.scene.primitives.add(resaltado);
    viewer.scene.requestRender();
  }

  function volarA(pais) {
    var b = pais.bbox;
    viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(b[0], b[1], b[2], b[3]),
      duration: 1.2,
    });
  }

  // ---------- Interacción ----------
  // Cuántos grados abarcan ~14 píxeles en pantalla: sirve de margen de tolerancia
  // y se ajusta solo al zoom (de lejos perdona más, de cerca exige precisión).
  function toleranciaGrados(posicion) {
    var elip = viewer.scene.globe.ellipsoid;
    var a = viewer.camera.pickEllipsoid(posicion, elip);
    var b = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(posicion.x + 14, posicion.y), elip);
    if (!a || !b) return 1.2;
    var ca = Cesium.Cartographic.fromCartesian(a), cb = Cesium.Cartographic.fromCartesian(b);
    var dLon = Cesium.Math.toDegrees(cb.longitude - ca.longitude) * Math.cos(ca.latitude);
    var dLat = Cesium.Math.toDegrees(cb.latitude - ca.latitude);
    var d = Math.sqrt(dLon * dLon + dLat * dLat);
    return Math.min(3, Math.max(0.12, d));
  }

  // Proyecta el punto de pantalla sobre el elipsoide y devuelve el país de esas coordenadas
  function paisEnPantalla(posicionPantalla) {
    var cartesiano = viewer.camera.pickEllipsoid(posicionPantalla, viewer.scene.globe.ellipsoid);
    if (!cartesiano) return null;
    var carto = Cesium.Cartographic.fromCartesian(cartesiano);
    return paisEn(
      Cesium.Math.toDegrees(carto.longitude),
      Cesium.Math.toDegrees(carto.latitude),
      toleranciaGrados(posicionPantalla)
    );
  }

  var manejador = viewer.screenSpaceEventHandler;
  var confirmado = null; // país cuyo filtro está aplicado en la app

  // Tocar fuera de tierra no descarta el país que se está mostrando: vuelve a él
  function volverAlConfirmado() {
    resaltar(confirmado);
    mostrarEtiqueta(
      confirmado ? confirmado.nombre : 'Tocá un país',
      confirmado ? AYUDA_ELEGIDO : AYUDA_TOCAR
    );
  }

  manejador.setInputAction(function (click) {
    var pais = paisEnPantalla(click.position);
    if (!pais) {
      volverAlConfirmado();
      enviar({ type: 'sinPais' });
      return;
    }
    resaltar(pais);
    mostrarEtiqueta(
      pais.nombre,
      confirmado && confirmado.iso === pais.iso
        ? AYUDA_ELEGIDO
        : AYUDA_TOCAR
    );
    enviar({ type: 'pais', iso: pais.iso, nombre: pais.nombre });
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  manejador.setInputAction(function (click) {
    var pais = paisEnPantalla(click.position);
    if (!pais) return;
    confirmado = pais;
    resaltar(pais);
    volarA(pais);
    mostrarEtiqueta(pais.nombre, AYUDA_ELEGIDO);
    enviar({ type: 'paisConfirmado', iso: pais.iso, nombre: pais.nombre });
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  // Cesium hace zoom por defecto al doble clic: se desactiva para que no pelee con el filtro
  manejador.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK, Cesium.KeyboardEventModifier.CTRL);

  // ---------- API para la app ----------
  // Hooks de depuración (usados por las pruebas automatizadas)
  window.__paisEn = paisEn;
  window.__paises = paises;

  window.seleccionarPais = function (codigo) {
    var pais = paisPorIso(codigo);
    if (!pais) return false;
    confirmado = pais;
    resaltar(pais);
    volarA(pais);
    mostrarEtiqueta(pais.nombre, AYUDA_ELEGIDO);
    return true;
  };
  window.limpiarSeleccion = function () {
    confirmado = null;
    resaltar(null);
    mostrarEtiqueta('Tocá un país', AYUDA_TOCAR);
  };

  window.addEventListener('message', function (ev) {
    try {
      var data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
      if (!data) return;
      if (data.type === 'seleccionarPais') window.seleccionarPais(data.iso);
      if (data.type === 'limpiarSeleccion') window.limpiarSeleccion();
    } catch (_) {}
  });

  // ---------- Carga ----------
  fetch(GEOJSON)
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (geo) {
      (geo.features || []).forEach(function (f) {
        var g = f.geometry, props = f.properties || {};
        if (!g) return;
        var polys = g.type === 'Polygon' ? [g.coordinates] : (g.type === 'MultiPolygon' ? g.coordinates : null);
        if (!polys || !polys.length) return;
        var codigo = isoDe(props);
        if (!codigo) return;
        var tieneEtiqueta = typeof props.LABEL_X === 'number' && typeof props.LABEL_Y === 'number';
        var centro = tieneEtiqueta ? [props.LABEL_X, props.LABEL_Y] : centroDe(polys);
        paises.push({
          iso: codigo, nombre: nombreDe(props), poligonos: polys,
          bbox: bboxDe(polys), area: areaDe(polys),
          etiquetaLon: centro ? centro[0] : null, etiquetaLat: centro ? centro[1] : null,
          rango: typeof props.LABELRANK === 'number' ? props.LABELRANK : 6,
        });
      });

      dibujarFronteras();
      dibujarNombres();
      estado.style.display = 'none';
      viewer.scene.requestRender();
      enviar({ type: 'listo', cantidadPaises: paises.length });

      if (ISO_INICIAL) window.seleccionarPais(ISO_INICIAL);
      else mostrarEtiqueta('Tocá un país', AYUDA_TOCAR);
    })
    .catch(function (e) {
      estado.textContent = 'No se pudieron cargar las fronteras.';
      enviar({ type: 'error', mensaje: e.message });
    });
})();
</script>
</body>
</html>`;
}
