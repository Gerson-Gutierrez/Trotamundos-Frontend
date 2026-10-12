import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import TarjetaPublicacionCompacta from '../../components/publicacion/TarjetaPublicacionCompacta';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Mensaje from '../../components/common/Mensaje';
import Icono from '../../components/common/Icono';
import { colors } from '../../constants/colors';
import { favoritosApi } from '../../api/favoritosApi';
import { usePaises } from '../../hooks/usePaises';
import { t } from '../../i18n';
import { mensajeError } from '../../utils/formatters';

// Publicaciones de otros viajeros que el usuario guardó. Mismo formato de tarjeta que el inicio,
// pero sin fecha: bandera, país y ciudad.
export default function FavoritosScreen({ navigation }) {
  const { paises } = usePaises();
  const [favoritas, setFavoritas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Se recarga cada vez que se entra: así refleja lo que se guardó o quitó en el detalle
  useFocusEffect(useCallback(() => {
    let activo = true;
    favoritosApi.listar()
      .then((d) => { if (activo) { setFavoritas(d); setError(''); } })
      .catch((e) => activo && setError(mensajeError(e)))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []));

  const isoPorId = useMemo(() => {
    const mapa = {};
    for (const p of paises) mapa[p.paisId] = p.codigoIso;
    return mapa;
  }, [paises]);

  if (cargando) return <LoadingSpinner />;

  return (
    <FlatList
      style={styles.pantalla}
      data={favoritas}
      keyExtractor={(p) => String(p.publicacionId)}
      contentContainerStyle={styles.lista}
      ListHeaderComponent={<Mensaje texto={error} />}
      ListEmptyComponent={
        error ? null : (
          <View style={styles.vacio}>
            <Icono nombre="favorito" size={44} color={colors.textoSecundario} />
            <Text style={styles.vacioTitulo}>{t('Todavía no guardaste publicaciones')}</Text>
            <Text style={styles.vacioTexto}>{t('Tocá el marcador de una publicación para guardarla acá.')}</Text>
          </View>
        )
      }
      renderItem={({ item }) => (
        <TarjetaPublicacionCompacta
          publicacion={item}
          codigoIso={item.codigoIsoPais || isoPorId[item.paisId]}
          mostrarFecha={false}
          onPress={() => navigation.navigate('DetallePublicacion', { id: item.publicacionId })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  lista: { padding: 16, paddingBottom: 40, width: '100%', maxWidth: 720, alignSelf: 'center' },
  vacio: { alignItems: 'center', gap: 10, paddingVertical: 60, paddingHorizontal: 24 },
  vacioTitulo: { color: colors.texto, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  vacioTexto: { color: colors.textoSecundario, fontSize: 14, textAlign: 'center' },
});
