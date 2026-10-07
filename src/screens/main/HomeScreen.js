import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import GlobeWebView from '../../components/globe/GlobeWebView';
import TarjetaPublicacionCompacta from '../../components/publicacion/TarjetaPublicacionCompacta';
import SelectorPais from '../../components/common/SelectorPais';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Mensaje from '../../components/common/Mensaje';
import { colors } from '../../constants/colors';
import { mapasApi } from '../../api/mapasApi';
import { usePaises } from '../../hooks/usePaises';
import { usePublicaciones } from '../../hooks/usePublicaciones';
import { mensajeError } from '../../utils/formatters';

export default function HomeScreen({ navigation, route }) {
  const globoRef = useRef(null);
  const { paises, porIso } = usePaises();
  const { height } = useWindowDimensions();
  // paisTocado: solo se muestra el nombre (un toque). pais: filtro aplicado (doble toque).
  const [paisTocado, setPaisTocado] = useState(null);
  const [pais, setPais] = useState(null);
  const [ciudades, setCiudades] = useState([]);
  const [ciudad, setCiudad] = useState(null);   // null = todas las ciudades del país
  const [errorGlobo, setErrorGlobo] = useState('');

  const { publicaciones, cargando, refrescando, error, recargar } = usePublicaciones({
    paisId: pais?.paisId,
    ciudadId: ciudad?.ciudadId,
  });

  // Traduce el código ISO que manda el globo a un país del backend
  const resolverPais = useCallback(async (iso, nombre) => {
    const enCache = porIso[iso];
    if (enCache) return enCache;
    try {
      return await mapasApi.paisPorIso(iso);
    } catch {
      setErrorGlobo(`"${nombre}" todavía no está disponible en Trotamundos.`);
      return null;
    }
  }, [porIso]);

  // Aplica el filtro: carga las ciudades con publicaciones de ese país
  const aplicarFiltro = useCallback(async (nuevo, { volarEnGlobo = false } = {}) => {
    if (!nuevo) return;
    setErrorGlobo('');
    setPais(nuevo);
    setPaisTocado(nuevo);
    setCiudad(null);
    if (volarEnGlobo && nuevo.codigoIso) globoRef.current?.seleccionarPais(nuevo.codigoIso);
    try {
      setCiudades(await mapasApi.ciudades(nuevo.paisId, true));
    } catch {
      setCiudades([]);
    }
  }, []);

  // Un toque en el globo: mostrar el nombre del país, sin filtrar todavía
  const manejarPaisTocado = useCallback(async ({ iso, nombre }) => {
    setErrorGlobo('');
    setPaisTocado({ nombre, codigoIso: iso });
    const encontrado = await resolverPais(iso, nombre);
    if (encontrado) setPaisTocado(encontrado);
  }, [resolverPais]);

  // Doble toque: aplicar el filtro directamente
  const manejarPaisConfirmado = useCallback(async ({ iso, nombre }) => {
    const encontrado = await resolverPais(iso, nombre);
    if (encontrado) aplicarFiltro(encontrado);
  }, [resolverPais, aplicarFiltro]);

  const limpiar = () => {
    setPais(null);
    setPaisTocado(null);
    setCiudad(null);
    setCiudades([]);
    setErrorGlobo('');
    globoRef.current?.limpiarSeleccion();
  };

  // Selección hecha en la pantalla de globo a pantalla completa
  useEffect(() => {
    if (route.params?.pais) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      aplicarFiltro(route.params.pais, { volarEnGlobo: true });
      navigation.setParams({ pais: undefined });
    }
  }, [route.params?.pais, aplicarFiltro, navigation]);

  // Refresca el feed al volver (p. ej. después de publicar)
  useFocusEffect(useCallback(() => { if (!cargando) recargar(); }, [])); // eslint-disable-line react-hooks/exhaustive-deps

  // ISO de cada publicación para mostrar la bandera (el feed trae paisId / nombrePais)
  const isoDe = useMemo(() => {
    const porId = {}, porNombre = {};
    for (const p of paises) {
      porId[p.paisId] = p.codigoIso;
      porNombre[p.nombre?.toLowerCase()] = p.codigoIso;
    }
    return (pub) => pub.codigoIso || porId[pub.paisId] || porNombre[pub.nombrePais?.toLowerCase()] || null;
  }, [paises]);

  // El país tocado todavía no filtra; el confirmado sí
  const mostrandoPais = pais && paisTocado && pais.paisId === paisTocado.paisId;

  const cabecera = (
    <View style={styles.fijo}>
      {/* El globo queda fuera de la lista para que arrastrar y hacer zoom no mueva el scroll */}
      <View style={[styles.globo, { height: Math.round(height * 0.5) }]}>
        <GlobeWebView
          ref={globoRef}
          onPaisTocado={manejarPaisTocado}
          onPaisConfirmado={manejarPaisConfirmado}
          onSinPais={() => setPaisTocado(pais)}
          onError={setErrorGlobo}
        />
        {/* Actualiza el feed (sin pull-to-refresh, que estorbaba al usar el globo) */}
        <Pressable style={styles.actualizar} onPress={recargar} disabled={refrescando} hitSlop={8}
          accessibilityLabel="Actualizar publicaciones">
          {refrescando
            ? <ActivityIndicator size="small" color={colors.primario} />
            : <Ionicons name="refresh" size={20} color={colors.texto} />}
        </Pressable>
      </View>

      {/* Nombre del país tocado + acción para verlo (alternativa al doble toque) */}
      {paisTocado && (
        <View style={styles.tocado}>
          <View style={styles.tocadoTextos}>
            <Text style={styles.tocadoNombre} numberOfLines={1}>📍 {paisTocado.nombre}</Text>
            <Text style={styles.tocadoAyuda}>
              {mostrandoPais ? 'Mostrando sus publicaciones' : 'Tocá dos veces el país, o usá el botón'}
            </Text>
          </View>
          {!mostrandoPais && paisTocado.paisId && (
            <Pressable style={styles.boton} onPress={() => aplicarFiltro(paisTocado)}>
              <Text style={styles.botonTexto}>Ver publicaciones</Text>
            </Pressable>
          )}
        </View>
      )}

      <Mensaje texto={errorGlobo} tipo="info" style={styles.margenLateral} />

      <View style={styles.filtros}>
        <SelectorPais
          etiqueta={null}
          valor={pais}
          onSeleccion={(p) => aplicarFiltro(p, { volarEnGlobo: true })}
          placeholder="Buscar país…"
        />

        {pais && (
          <View style={styles.paisSeleccionado}>
            <Text style={styles.paisNombre}>{pais.nombre}</Text>
            <Pressable onPress={limpiar}>
              <Text style={styles.enlace}>Ver todos</Text>
            </Pressable>
          </View>
        )}

        {pais && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            <Chip activo={!ciudad} texto="Todas las ciudades" onPress={() => setCiudad(null)} />
            {ciudades.map((c) => (
              <Chip key={c.ciudadId} activo={ciudad?.ciudadId === c.ciudadId} texto={c.nombre} onPress={() => setCiudad(c)} />
            ))}
            {ciudades.length === 0 && <Text style={styles.sinCiudades}>Todavía no hay publicaciones en este país</Text>}
          </ScrollView>
        )}
      </View>

      <Text style={styles.tituloLista}>
        {pais ? `Publicaciones en ${ciudad ? ciudad.nombre : pais.nombre}` : 'Últimas publicaciones'}
      </Text>
      {error && <Mensaje texto={mensajeError(error)} style={styles.margenLateral} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {cabecera}
      <FlatList
        style={styles.flex}
        data={publicaciones}
        keyExtractor={(p) => String(p.publicacionId)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          cargando ? <LoadingSpinner pantallaCompleta={false} /> : (
            <Text style={styles.vacio}>
              {pais
                ? `Todavía nadie publicó sobre ${ciudad ? ciudad.nombre : pais.nombre}. ¡Podés ser el primero!`
                : 'No hay publicaciones todavía. ¡Sé el primero en contar tu viaje!'}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TarjetaPublicacionCompacta publicacion={item} codigoIso={isoDe(item)}
              onPress={() => navigation.navigate('DetallePublicacion', { id: item.publicacionId })} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function Chip({ texto, activo, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, activo && styles.chipActivo]}>
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  flex: { flex: 1 },
  fijo: { flexShrink: 0 },
  lista: { paddingBottom: 24 },
  margenLateral: { marginHorizontal: 20 },
  enlace: { color: colors.primario, fontWeight: '600' },
  globo: { marginHorizontal: 12, marginTop: 8, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.borde },
  actualizar: {
    position: 'absolute', top: 10, right: 10, width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(17,24,39,0.75)',
  },
  tocado: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 10, padding: 12,
    backgroundColor: colors.superficie, borderRadius: 12, borderWidth: 1, borderColor: colors.primario,
  },
  tocadoTextos: { flex: 1 },
  tocadoNombre: { color: colors.texto, fontSize: 17, fontWeight: '800' },
  tocadoAyuda: { color: colors.textoSecundario, fontSize: 12, marginTop: 2 },
  boton: { backgroundColor: colors.primario, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  botonTexto: { color: colors.fondo, fontWeight: '800', fontSize: 13 },
  filtros: { paddingHorizontal: 20, marginTop: 10 },
  paisSeleccionado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  paisNombre: { color: colors.texto, fontSize: 18, fontWeight: '800' },
  chips: { marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, marginRight: 8 },
  chipActivo: { backgroundColor: colors.primario, borderColor: colors.primario },
  chipTexto: { color: colors.texto, fontSize: 13 },
  chipTextoActivo: { color: colors.fondo, fontWeight: '700' },
  sinCiudades: { color: colors.textoSecundario, alignSelf: 'center', fontSize: 13, marginLeft: 6 },
  tituloLista: { color: colors.texto, fontSize: 15, fontWeight: '700', paddingHorizontal: 20, marginTop: 4, marginBottom: 8 },
  item: { paddingHorizontal: 20 },
  vacio: { color: colors.textoSecundario, textAlign: 'center', padding: 30 },
});
