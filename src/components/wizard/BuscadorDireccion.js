import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import Input from '../common/Input';
import { colors } from '../../constants/colors';
import { lugaresApi } from '../../api/lugaresApi';
// La geocodificación inversa sigue sirviendo para el botón "Estoy acá"
import { geocodingApi } from '../../api/geocodingApi';
import { sinProtocolo } from '../../utils/formatters';
import { t } from '../../i18n';
import Icono, { TextoIcono } from '../common/Icono';

const ESPERA_MS = 350;
const MINIMO_CARACTERES = 2;

/**
 * Buscador de alojamientos y restaurantes por nombre.
 * Consulta el backend, que busca sobre los puntos de interés de OpenStreetMap:
 * escribir "hotel" en Salta trae decenas de alojamientos, mientras que
 * geocodificar la misma consulta devolvía uno solo.
 *
 * onUbicacion({ nombre, direccion, latitud, longitud, sitioWeb, categoria, etiqueta })
 */
export default function BuscadorDireccion({
  valor,
  onCambioTexto,
  onUbicacion,
  codigoPais,
  ciudad,
  categoria,
  etiqueta = 'Dirección o nombre del lugar',
  placeholder = 'Ej. Hostel Lagares, Av. San Martín 1200…',
  permitirUbicacionActual = true,
}) {
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [ubicando, setUbicando] = useState(false);

  const abortRef = useRef(null);
  // Textos que ya corresponden a un lugar elegido: evita volver a buscar
  // cuando el padre reescribe el campo con el nombre o la dirección del lugar.
  const yaElegidos = useRef([]);

  const buscar = useCallback(async (texto) => {
    abortRef.current?.abort();
    const control = new AbortController();
    abortRef.current = control;

    setBuscando(true);
    setAviso('');
    try {
      const lista = await lugaresApi.buscar(categoria, texto, {
        ciudad,
        pais: codigoPais,
        signal: control.signal,
      });
      if (control.signal.aborted) return;
      setResultados(lista);
      if (!lista.length) setAviso(t('No encontramos ese lugar. Probá con otro nombre o marcá el punto en el mapa.'));
    } catch (e) {
      if (e.code === 'ERR_CANCELED' || e.name === 'CanceledError' || e.name === 'AbortError') return;
      setAviso(t('No se pudo buscar. Podés escribir el nombre y marcar el punto en el mapa.'));
    } finally {
      if (!control.signal.aborted) setBuscando(false);
    }
  }, [codigoPais, ciudad, categoria]);

  // Busca sola mientras el usuario escribe
  useEffect(() => {
    const texto = (valor || '').trim();
    if (texto.length < MINIMO_CARACTERES || yaElegidos.current.includes(texto)) {
      setResultados([]);
      setBuscando(false);
      return;
    }
    const id = setTimeout(() => buscar(texto), ESPERA_MS);
    return () => clearTimeout(id);
  }, [valor, buscar]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const elegir = (lugar) => {
    // El padre decide qué queda en el campo (nombre o dirección); acá solo se
    // registran ambos para no relanzar la búsqueda con ese texto.
    yaElegidos.current = [lugar.nombre, lugar.direccion].filter(Boolean);
    abortRef.current?.abort();
    setResultados([]);
    setAviso('');
    setBuscando(false);
    onUbicacion?.(lugar);
  };

  const usarUbicacionActual = async () => {
    setAviso('');
    setUbicando(true);
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (!permiso.granted) {
        setAviso(t('Necesitamos permiso de ubicación para detectar dónde estás.'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lugar = await geocodingApi.inverso(pos.coords.latitude, pos.coords.longitude);
      if (!lugar) {
        setAviso(t('No pudimos identificar tu ubicación actual.'));
        return;
      }
      elegir({ ...lugar, latitud: pos.coords.latitude, longitud: pos.coords.longitude });
    } catch {
      setAviso(t('No se pudo obtener tu ubicación.'));
    } finally {
      setUbicando(false);
    }
  };

  return (
    <View>
      <Input
        etiqueta={etiqueta}
        value={valor}
        onChangeText={onCambioTexto}
        placeholder={placeholder}
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={() => (valor || '').trim().length >= MINIMO_CARACTERES && buscar(valor.trim())}
        style={styles.sinMargen}
      />

      <View style={styles.barra}>
        {buscando ? (
          <View style={styles.estado}>
            <ActivityIndicator size="small" color={colors.primario} />
            <Text style={styles.estadoTexto}>{t('Buscando lugares…')}</Text>
          </View>
        ) : (
          <Text style={styles.ayuda}>{t('Escribí al menos {n} letras y elegí de la lista', { n: MINIMO_CARACTERES })}</Text>
        )}

        {permitirUbicacionActual && (
          <Pressable onPress={usarUbicacionActual} disabled={ubicando} style={styles.gps}>
            {ubicando ? (
              <Text style={styles.gpsTexto}>{t('Ubicando…')}</Text>
            ) : (
              <TextoIcono icono="gps" size={14} color={colors.primario} style={styles.gpsTexto}>{t('Estoy acá')}</TextoIcono>
            )}
          </Pressable>
        )}
      </View>

      {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

      {resultados.map((lugar) => (
        <Pressable
          key={`${lugar.nombre}-${lugar.latitud}-${lugar.longitud}`}
          onPress={() => elegir(lugar)}
          style={({ pressed }) => [styles.resultado, pressed && styles.resultadoPresionado]}
        >
          <Icono nombre={lugar.categoria === 'alojamiento' || lugar.categoria === 'restaurante' || lugar.categoria === 'agencia' ? lugar.categoria : 'ubicacion'}
            size={22} color={colors.primario} />
          <View style={styles.resultadoTextos}>
            <Text style={styles.nombre} numberOfLines={1}>{lugar.nombre}</Text>
            {lugar.direccion ? <Text style={styles.direccion} numberOfLines={2}>{lugar.direccion}</Text> : null}
            {lugar.sitioWeb ? (
              <TextoIcono icono="web" size={12} color={colors.primario} style={styles.web} numberOfLines={1}>{sinProtocolo(lugar.sitioWeb)}</TextoIcono>
            ) : null}
          </View>
          <Text style={[styles.insignia, lugar.fuente === 'poi' && styles.insigniaDestacada]}>
            {t(lugar.etiqueta)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sinMargen: { marginBottom: 6 },
  barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10 },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  estadoTexto: { color: colors.textoSecundario, fontSize: 12 },
  ayuda: { color: colors.textoSecundario, fontSize: 12, flex: 1 },
  gps: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.borde, backgroundColor: colors.superficie },
  gpsTexto: { color: colors.primario, fontSize: 12, fontWeight: '700' },
  aviso: { color: colors.advertencia, fontSize: 13, marginBottom: 10 },
  resultado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.superficieClara,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  resultadoPresionado: { opacity: 0.7 },
  resultadoTextos: { flex: 1 },
  nombre: { color: colors.texto, fontSize: 15, fontWeight: '700' },
  direccion: { color: colors.textoSecundario, fontSize: 12, marginTop: 2 },
  web: { color: colors.primario, fontSize: 11, marginTop: 2 },
  insignia: { color: colors.textoSecundario, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  insigniaDestacada: { color: colors.primario },
});
