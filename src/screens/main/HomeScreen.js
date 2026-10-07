import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import GlobeWebView from '../../components/globe/GlobeWebView';
import TarjetaPublicacionCompacta from '../../components/publicacion/TarjetaPublicacionCompacta';
import SelectorPais from '../../components/common/SelectorPais';
import SelectorCiudad from '../../components/common/SelectorCiudad';
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
  // País cuyo filtro está aplicado (doble toque en el globo o elegido en el desplegable)
  const [pais, setPais] = useState(null);
  const [ciudad, setCiudad] = useState(null); // null = todas las ciudades del país
  const [errorGlobo, setErrorGlobo] = useState('');
  const [version, setVersion] = useState(0); // cambia para forzar la recarga del feed

  const { publicaciones, cargando, error, recargar } = usePublicaciones({
    paisId: pais?.paisId,
    ciudadId: ciudad?.ciudadId,
    version,
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

  const aplicarFiltro = useCallback((nuevo, { volarEnGlobo = false } = {}) => {
    if (!nuevo) return;
    setErrorGlobo('');
    setPais(nuevo);
    setCiudad(null);
    if (volarEnGlobo && nuevo.codigoIso) globoRef.current?.seleccionarPais(nuevo.codigoIso);
  }, []);

  // Doble toque en el globo: aplicar el filtro
  const manejarPaisConfirmado = useCallback(async ({ iso, nombre }) => {
    const encontrado = await resolverPais(iso, nombre);
    if (encontrado) aplicarFiltro(encontrado);
  }, [resolverPais, aplicarFiltro]);

  // Tocar "Inicio" en el menú: feed completo sin filtros, recargado desde el servidor
  useEffect(() => {
    if (!route.params?.reiniciar) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPais(null);
    setCiudad(null);
    setErrorGlobo('');
    setVersion((v) => v + 1);
    globoRef.current?.limpiarSeleccion();
  }, [route.params?.reiniciar]);

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

  const cabecera = (
    <View style={styles.fijo}>
      {/* El globo queda fuera de la lista para que arrastrar y hacer zoom no mueva el scroll */}
      <View style={[styles.globo, { height: Math.round(height * 0.5) }]}>
        <GlobeWebView
          ref={globoRef}
          onPaisConfirmado={manejarPaisConfirmado}
          onError={setErrorGlobo}
        />
      </View>

      <Mensaje texto={errorGlobo} tipo="info" style={styles.margenLateral} />

      {/* Con un país elegido aparece al lado el desplegable de sus ciudades */}
      <View style={styles.filtros}>
        <View style={styles.filtro}>
          <SelectorPais
            etiqueta={null}
            valor={pais}
            onSeleccion={(p) => aplicarFiltro(p, { volarEnGlobo: true })}
            placeholder="Buscar país…"
          />
        </View>
        {pais && (
          <View style={styles.filtro}>
            <SelectorCiudad
              etiqueta={null}
              paisId={pais.paisId}
              paisNombre={pais.nombre}
              valor={ciudad}
              onSeleccion={setCiudad}
              placeholder="Todas las ciudades"
              soloConPublicaciones
            />
          </View>
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
          cargando ? null : (
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  flex: { flex: 1 },
  fijo: { flexShrink: 0 },
  lista: { paddingBottom: 24 },
  margenLateral: { marginHorizontal: 20 },
  globo: { marginHorizontal: 12, marginTop: 8, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.borde },
  filtros: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 10 },
  filtro: { flex: 1, minWidth: 0 },
  tituloLista: { color: colors.texto, fontSize: 15, fontWeight: '700', paddingHorizontal: 20, marginTop: 4, marginBottom: 8 },
  item: { paddingHorizontal: 20 },
  vacio: { color: colors.textoSecundario, textAlign: 'center', padding: 30 },
});
