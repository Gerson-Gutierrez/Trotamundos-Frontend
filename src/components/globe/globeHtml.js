
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
export function construirGlobeHtml({ isoInicial = '', idioma = 'es' } = {}) {
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
  html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: #000; }
  /* El globo se dibuja con fondo transparente sobre el cielo estrellado pintado en este canvas */
  #espacio, #halo { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  #globo { position: absolute; inset: 0; background: transparent; }
  #creditos { display: none; }
  #estado {
    position: absolute; top: 8px; left: 8px; right: 8px; padding: 6px; text-align: center;
    font: 13px system-ui, sans-serif; color: ${colors.textoSecundario}; pointer-events: none;
  }
  .cesium-viewer-bottom { display: none !important; }
  #atribucion {
    position: absolute; right: 6px; bottom: 4px; pointer-events: none;
    font: 9px system-ui, sans-serif; color: rgba(255,255,255,0.45);
  }
</style>
</head>
<body>
<canvas id="espacio"></canvas>
<canvas id="halo"></canvas>
<div id="globo"></div>
<div id="creditos"></div>
<div id="estado">Cargando globo…</div>
<div id="atribucion"></div>
<script>
(function () {
  var TOKEN = ${JSON.stringify(CESIUM_ION_TOKEN)};
  var ISO_INICIAL = ${JSON.stringify(isoInicial)};
  // Natural Earth trae el nombre de cada país en varios idiomas (NAME_EN, NAME_ES, NAME_PT, NAME_FR…)
  var CLAVE_NOMBRE = 'NAME_' + ${JSON.stringify(String(idioma).toUpperCase())};
  var GEOJSON = ${JSON.stringify(GEOJSON_URL)};
  var DENSIDAD = Math.min(2, window.devicePixelRatio || 1); // píxeles físicos por píxel CSS al renderizar
  var IMAGENES_ESRI = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
  // Fronteras finas grisáceas, como en un atlas satelital
  var COLOR_BORDE = Cesium.Color.WHITE.withAlpha(0.5);
  var COLOR_SELECCION = Cesium.Color.fromCssColorString('${colors.primario}');
  var estado = document.getElementById('estado');

  function enviar(msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  }

  // ---------- Cielo de fondo ----------
  // Espacio negro con estrellas tenues, pintado una vez en un canvas detrás del globo.
  function pintarCielo() {
    var lienzo = document.getElementById('espacio');
    var escala = window.devicePixelRatio || 1;
    var w = window.innerWidth, h = window.innerHeight;
    lienzo.width = w * escala; lienzo.height = h * escala;
    var ctx = lienzo.getContext('2d');
    ctx.scale(escala, escala);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    var cantidad = Math.round((w * h) / 2200);
    for (var i = 0; i < cantidad; i++) {
      var grande = Math.random() < 0.04;
      ctx.globalAlpha = grande ? 0.6 + Math.random() * 0.4 : 0.15 + Math.random() * 0.45;
      ctx.fillStyle = Math.random() < 0.15 ? '#cfe0ff' : '#ffffff';
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, grande ? 0.9 + Math.random() * 0.6 : 0.3 + Math.random() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  pintarCielo();
  window.addEventListener('resize', pintarCielo);

  // ---------- Viewer ----------
  var viewer;
  try {
    if (TOKEN) Cesium.Ion.defaultAccessToken = TOKEN;
    var opciones = {
      animation: false, timeline: false, baseLayerPicker: false, geocoder: false, homeButton: false,
      sceneModePicker: false, navigationHelpButton: false, fullscreenButton: false, infoBox: false,
      selectionIndicator: false, creditContainer: 'creditos', targetFrameRate: 30,
      // Fondo transparente: se ve la galaxia del canvas #espacio por detrás
      skyBox: false, contextOptions: { webgl: { alpha: true } },
      // Renderiza a la resolución real de la pantalla (por defecto Cesium usa píxeles CSS y en
      // teléfonos de alta densidad el globo y los nombres se ven pixelados)
      useBrowserRecommendedResolution: false, msaaSamples: 4,
    };
    if (!TOKEN) {
      // Sin Cesium Ion: imagen satelital de Esri World Imagery (no requiere token, exige atribución)
      opciones.baseLayer = Cesium.ImageryLayer.fromProviderAsync(
        Cesium.ArcGisMapServerImageryProvider.fromUrl(IMAGENES_ESRI)
      );
      document.getElementById('atribucion').textContent = 'Imágenes © Esri, Maxar, Earthstar Geographics';
    }
    viewer = new Cesium.Viewer('globo', opciones);
    window.__viewer = viewer;
  } catch (e) {
    estado.textContent = 'No se pudo iniciar el globo: ' + e.message;
    enviar({ type: 'error', mensaje: e.message });
    return;
  }

  var escena = viewer.scene;
  escena.backgroundColor = Cesium.Color.TRANSPARENT;
  if (escena.sun) escena.sun.show = false;
  if (escena.moon) escena.moon.show = false;
  escena.globe.enableLighting = false;
  escena.globe.baseColor = Cesium.Color.fromCssColorString('#0b2a4a');
  // Hasta 2x la densidad de la pantalla: nítido sin castigar el rendimiento en teléfonos de 3x
  viewer.resolutionScale = DENSIDAD / (window.devicePixelRatio || 1);
  // Pide teselas de imagen un poco más detalladas (por defecto 2)
  escena.globe.maximumScreenSpaceError = 1.5;

  // Un poco más de vida a la imagen satelital, sin perder el aspecto natural
  var capaBase = viewer.imageryLayers.get(0);
  if (capaBase) {
    capaBase.saturation = 1.15;
    capaBase.contrast = 1.08;
    capaBase.brightness = 1.05;
  }

  // La atmósfera de Cesium no se ve sobre un fondo transparente (y la del suelo vuelve
  // translúcido al globo): se reemplaza por un halo propio dibujado en #halo.
  escena.skyAtmosphere.show = false;
  escena.globe.showGroundAtmosphere = false;

  // ---------- Halo de atmósfera ----------
  // Se proyecta el centro de la Tierra a pantalla y se calcula el radio aparente del globo
  // según la distancia de la cámara; el halo se redibuja solo cuando cambian.
  var halo = document.getElementById('halo');
  var ctxHalo = halo.getContext('2d');
  var ultimoHalo = '';
  var aVentana = Cesium.SceneTransforms.worldToWindowCoordinates || Cesium.SceneTransforms.wgs84ToWindowCoordinates;

  function dibujarHalo() {
    var escala = window.devicePixelRatio || 1;
    var w = window.innerWidth, h = window.innerHeight;
    var centro = aVentana(escena, Cesium.Cartesian3.ZERO);
    var distancia = Cesium.Cartesian3.magnitude(viewer.camera.positionWC);
    var R = Cesium.Ellipsoid.WGS84.maximumRadius;
    var clave = '';
    var radio = 0;
    if (centro && distancia > R) {
      var angulo = Math.asin(R / distancia);
      radio = Math.tan(angulo) / Math.tan(viewer.camera.frustum.fovy / 2) * (h / 2);
      clave = Math.round(centro.x) + ',' + Math.round(centro.y) + ',' + Math.round(radio) + ',' + w + 'x' + h;
    }
    if (clave === ultimoHalo) return;
    ultimoHalo = clave;

    if (halo.width !== w * escala || halo.height !== h * escala) {
      halo.width = w * escala; halo.height = h * escala;
    }
    ctxHalo.setTransform(escala, 0, 0, escala, 0, 0);
    ctxHalo.clearRect(0, 0, w, h);
    if (!clave) return;

    // Borde fino: blanco azulado pegado al globo que se desvanece en azul
    var exterior = radio * 1.045;
    var g = ctxHalo.createRadialGradient(centro.x, centro.y, radio * 0.99, centro.x, centro.y, exterior);
    g.addColorStop(0, 'rgba(225, 240, 255, 1)');
    g.addColorStop(0.25, 'rgba(110, 170, 255, 0.95)');
    g.addColorStop(0.6, 'rgba(40, 100, 230, 0.45)');
    g.addColorStop(1, 'rgba(20, 60, 200, 0)');
    // Disco negro detrás del globo: la imagen satelital tiene algo de transparencia
    // y no debe dejar ver ni las estrellas ni el halo a través de la Tierra.
    ctxHalo.fillStyle = '#000';
    ctxHalo.beginPath();
    ctxHalo.arc(centro.x, centro.y, radio * 0.995, 0, Math.PI * 2);
    ctxHalo.fill();
    // Solo el anillo exterior
    ctxHalo.fillStyle = g;
    ctxHalo.beginPath();
    ctxHalo.arc(centro.x, centro.y, exterior, 0, Math.PI * 2);
    ctxHalo.arc(centro.x, centro.y, radio * 0.99, 0, Math.PI * 2, true);
    ctxHalo.fill('evenodd');
  }
  escena.postRender.addEventListener(dibujarHalo);
  // ---------- Cámara ----------
  // El globo arranca centrado y ocupando el recuadro; no se puede alejar más que eso
  // (si no, queda chiquito y se "desparrama"). Acercar se permite hasta ver un país.
  var R_TIERRA = Cesium.Ellipsoid.WGS84.maximumRadius;
  var ALTURA_MINIMA = 2000000; // alcanza para ver un país mediano entero
  var controlador = escena.screenSpaceCameraController;
  controlador.enableTilt = false;
  controlador.enableLook = false;
  controlador.enableTranslate = false;
  controlador.minimumZoomDistance = ALTURA_MINIMA;

  // Altura a la que el globo entra justo en el recuadro (con un pequeño margen para el borde)
  function alturaGloboCompleto() {
    var w = Math.max(1, window.innerWidth), h = Math.max(1, window.innerHeight);
    var tanMedio = Math.tan(viewer.camera.frustum.fovy / 2);
    var t = (0.46 * Math.min(w, h) * 2 / h) * tanMedio; // tan del radio angular buscado
    return R_TIERRA / Math.sin(Math.atan(t)) - R_TIERRA;
  }
  var alturaMaxima = alturaGloboCompleto();

  function ajustarLimites() {
    alturaMaxima = alturaGloboCompleto();
    controlador.maximumZoomDistance = alturaMaxima;
    var carto = viewer.camera.positionCartographic;
    if (carto.height > alturaMaxima) {
      viewer.camera.setView({ destination: Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, alturaMaxima) });
    }
  }
  viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(-60, -15, alturaMaxima) });
  ajustarLimites();
  window.addEventListener('resize', ajustarLimites);

  // El zoom de Cesium apunta al cursor y desplaza el globo: se reorienta la cámara
  // siempre hacia el centro de la Tierra para que quede centrado.
  var haciaCentro = new Cesium.Cartesian3(), arriba = new Cesium.Cartesian3(), proyeccion = new Cesium.Cartesian3();
  escena.preRender.addEventListener(function () {
    var cam = viewer.camera;
    Cesium.Cartesian3.normalize(Cesium.Cartesian3.negate(cam.positionWC, haciaCentro), haciaCentro);
    if (Cesium.Cartesian3.dot(haciaCentro, cam.directionWC) > 0.999999) return;
    // "Arriba" actual sin la componente en la nueva dirección
    Cesium.Cartesian3.multiplyByScalar(haciaCentro, Cesium.Cartesian3.dot(cam.up, haciaCentro), proyeccion);
    Cesium.Cartesian3.subtract(cam.up, proyeccion, arriba);
    if (Cesium.Cartesian3.magnitude(arriba) < 1e-6) return;
    Cesium.Cartesian3.normalize(arriba, arriba);
    Cesium.Cartesian3.clone(haciaCentro, cam.direction);
    Cesium.Cartesian3.clone(arriba, cam.up);
    Cesium.Cartesian3.cross(cam.direction, cam.up, cam.right);
  });

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
    return p[CLAVE_NOMBRE] || p.NAME_ES || p.NAME_LONG || p.NAME || p.ADMIN || '';
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
  // Los países importantes (LABELRANK bajo) se ven desde el inicio; los demás aparecen al acercarse.
  var nombres = new Cesium.LabelCollection();
  viewer.scene.primitives.add(nombres);
  var etiquetasPaises = []; // { label, normal }

  // Umbrales relativos a la vista inicial: al arrancar se ven los países grandes del frente
  // y al acercarse van apareciendo los demás.
  function distanciaMaximaPorRango(rango) {
    var h0 = alturaMaxima;
    if (rango <= 2) return h0 * 1.6;
    if (rango === 3) return h0 * 1.12;
    if (rango === 4) return h0 * 0.6;
    if (rango === 5) return h0 * 0.45;
    return h0 * 0.32;
  }

  function dibujarNombres() {
    for (var i = 0; i < paises.length; i++) {
      var p = paises[i];
      if (!p.nombre || p.etiquetaLon == null) continue;
      var pos = Cesium.Cartesian3.fromDegrees(p.etiquetaLon, p.etiquetaLat, 30000);
      var label = nombres.add({
        position: pos,
        text: p.nombre.toUpperCase(),
        // Letras blancas en mayúscula con contorno oscuro, legibles sobre la imagen satelital
        // Se rasteriza al tamaño en píxeles físicos y se escala a 12px: así el texto queda nítido
        font: '800 ' + Math.round(12 * DENSIDAD) + 'px system-ui, sans-serif',
        scale: 1 / DENSIDAD,
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString('#111').withAlpha(0.9),
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        scaleByDistance: new Cesium.NearFarScalar(1500000, 1.0, 30000000, 0.8),
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

  // Vuela sobre el país a una altura acorde a su tamaño, dentro de los límites de zoom
  function volarA(pais) {
    var b = pais.bbox;
    var ancho = Math.min(b[2] - b[0], 120) * Math.cos(((b[1] + b[3]) / 2) * Math.PI / 180);
    var extension = Math.max(ancho, b[3] - b[1]);
    var altura = Math.min(alturaMaxima, Math.max(ALTURA_MINIMA, extension * 111000 * 1.4));
    var lon = pais.etiquetaLon != null ? pais.etiquetaLon : (b[0] + b[2]) / 2;
    var lat = pais.etiquetaLat != null ? pais.etiquetaLat : (b[1] + b[3]) / 2;
    viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(lon, lat, altura), duration: 1.2 });
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


  manejador.setInputAction(function (click) {
    var pais = paisEnPantalla(click.position);
    if (!pais) {
      // Tocar fuera de tierra no descarta el país que se está mostrando: vuelve a él
      resaltar(confirmado);
      enviar({ type: 'sinPais' });
      return;
    }
    resaltar(pais);
    enviar({ type: 'pais', iso: pais.iso, nombre: pais.nombre });
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  manejador.setInputAction(function (click) {
    var pais = paisEnPantalla(click.position);
    if (!pais) return;
    confirmado = pais;
    resaltar(pais);
    volarA(pais);
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
    return true;
  };
  window.limpiarSeleccion = function () {
    confirmado = null;
    resaltar(null);
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
