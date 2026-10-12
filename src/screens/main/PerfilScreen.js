import React, { useCallback, useState } from 'react';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import TarjetaPublicacion from '../../components/publicacion/TarjetaPublicacion';
import Button from '../../components/common/Button';
import BotonIdioma from '../../components/common/BotonIdioma';
import Icono from '../../components/common/Icono';
import ModalEliminarCuenta from '../../components/common/ModalEliminarCuenta';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../constants/colors';
import { publicacionesApi } from '../../api/publicacionesApi';
import { favoritosApi } from '../../api/favoritosApi';
import { useAuth } from '../../hooks/useAuth';
import { usePaises } from '../../hooks/usePaises';
import { t } from '../../i18n';
import { iniciales, nombrePais, urlImagen } from '../../utils/formatters';
import { avisar, confirmar } from '../../utils/dialogos';

export default function PerfilScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const { paises } = usePaises();
  const [publicaciones, setPublicaciones] = useState([]);
  const [cantidadFavoritos, setCantidadFavoritos] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [modalBaja, setModalBaja] = useState(false);

  const esAdmin = Boolean(usuario?.esAdmin);
  // La nacionalidad se guarda con el nombre del país en español: se busca su código para mostrarla en el idioma de la app
  const isoNacionalidad = paises.find((p) => p.nombre === usuario?.nacionalidad)?.codigoIso;
  // Solo los usuarios comunes pueden darse de baja; los administradores se gestionan aparte
  const puedeEliminarCuenta = !esAdmin && !usuario?.esSuperAdmin;

  useFocusEffect(useCallback(() => {
    let activo = true;

    // Si es admin, no consultamos sus publicaciones ni sus favoritos
    if (esAdmin) {
      setCargando(false);
      return;
    }

    publicacionesApi.mias()
      .then((d) => activo && setPublicaciones(d))
      .catch(() => {})
      .finally(() => activo && setCargando(false));

    favoritosApi.ids()
      .then((ids) => activo && setCantidadFavoritos(ids.length))
      .catch(() => {});

    return () => { activo = false; };
  }, [esAdmin]));

  const cerrarSesion = async () => {
    if (await confirmar('Cerrar sesión', '¿Querés salir de tu cuenta?', { textoOk: 'Salir', destructivo: true })) logout();
  };

  const cuentaEliminada = async () => {
    setModalBaja(false);
    await logout();
    avisar('Cuenta eliminada', 'Tu cuenta fue dada de baja correctamente.');
  };

  const abrirInstagram = () => {
    Linking.openURL(`https://www.instagram.com/${usuario.instagramUsuario}/`)
      .catch(() => avisar('No se pudo abrir la página', `instagram.com/${usuario.instagramUsuario}`));
  };

  const cabecera = (
    <View style={styles.cabecera}>
      <View style={styles.barraSuperior}>
        <BotonIdioma />
      </View>

      {usuario?.fotoPerfilUrl ? (
        <Image source={{ uri: urlImagen(usuario.fotoPerfilUrl) }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarVacio]}>
          <Text style={styles.avatarIniciales}>{iniciales(`${usuario?.nombre} ${usuario?.apellido}`)}</Text>
        </View>
      )}
      <Text style={styles.nombre}>{usuario?.nombre} {usuario?.apellido}</Text>
      <Text style={styles.dato}>{usuario?.email}</Text>
      <View style={styles.datoFila}>
        <Icono nombre="mundo" size={15} color={colors.textoSecundario} />
        <Text style={styles.dato}>{nombrePais(isoNacionalidad, usuario?.nacionalidad)}</Text>
        {esAdmin ? (
          <>
            <Text style={styles.dato}>·</Text>
            <Icono nombre="admin" size={15} color={colors.textoSecundario} />
            <Text style={styles.dato}>{t('Administrador')}</Text>
          </>
        ) : null}
      </View>

      {usuario?.instagramUsuario ? (
        <Pressable onPress={abrirInstagram} style={styles.datoFila} hitSlop={6} accessibilityRole="link">
          <Icono nombre="instagram" size={16} color={colors.primario} />
          <Text style={styles.instagram}>@{usuario.instagramUsuario}</Text>
        </Pressable>
      ) : !esAdmin ? (
        <Pressable onPress={() => navigation.navigate('EditarPerfil')} style={styles.datoFila} hitSlop={6}>
          <Icono nombre="instagram" size={16} color={colors.textoSecundario} />
          <Text style={styles.agregarRed}>{t('Agregar Instagram')}</Text>
        </Pressable>
      ) : null}

      <View style={styles.acciones}>
        <Button titulo="Editar perfil" variant="secundario" onPress={() => navigation.navigate('EditarPerfil')} style={styles.boton} />
        <Button titulo="Cerrar sesión" variant="secundario" onPress={cerrarSesion} style={styles.boton} />
      </View>

      {/* Publicaciones de otros viajeros que guardé */}
      {!esAdmin && (
        <Pressable onPress={() => navigation.navigate('Favoritos')} style={({ pressed }) => [styles.favoritos, pressed && styles.presionado]}>
          <Icono nombre="favoritoLleno" size={22} color={colors.primario} />
          <Text style={styles.favoritosTexto}>{t('Favoritos')}</Text>
          {cantidadFavoritos != null ? <Text style={styles.favoritosCantidad}>{cantidadFavoritos}</Text> : null}
          <Icono nombre="siguiente" size={22} color={colors.textoSecundario} />
        </Pressable>
      )}

      {puedeEliminarCuenta && (
        <Button titulo="Eliminar mi cuenta" variant="texto" onPress={() => setModalBaja(true)}
          style={styles.baja} textoStyle={styles.bajaTexto} />
      )}

      {/* Solo se muestra la sección de publicaciones si NO es admin */}
      {!esAdmin && (
        <Text style={styles.tituloLista}>{t('Mis publicaciones ({n})', { n: publicaciones.length })}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={esAdmin ? [] : publicaciones}
        keyExtractor={(p) => String(p.publicacionId)}
        ListHeaderComponent={cabecera}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          esAdmin ? null : (
            cargando ? <LoadingSpinner pantallaCompleta={false} /> : (
              <View style={styles.vacio}>
                <Text style={styles.vacioTexto}>{t('Todavía no publicaste ningún viaje.')}</Text>
                <Button titulo="Crear mi primera publicación" onPress={() => navigation.navigate('Wizard')} />
              </View>
            )
          )
        }
        renderItem={({ item }) => (
          <TarjetaPublicacion
            publicacion={item}
            onPress={() => navigation.navigate('DetallePublicacion', { id: item.publicacionId })}
          />
        )}
      />
      <ModalEliminarCuenta visible={modalBaja} onCerrar={() => setModalBaja(false)} onEliminada={cuentaEliminada} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  lista: { padding: 20, paddingBottom: 40, width: '100%', maxWidth: 720, alignSelf: 'center' },
  cabecera: { alignItems: 'center', marginBottom: 10 },
  barraSuperior: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.superficieClara, borderWidth: 2, borderColor: colors.primario },
  avatarVacio: { alignItems: 'center', justifyContent: 'center' },
  avatarIniciales: { color: colors.primario, fontSize: 32, fontWeight: '800' },
  nombre: { color: colors.texto, fontSize: 22, fontWeight: '800', marginTop: 12 },
  dato: { color: colors.textoSecundario },
  datoFila: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  instagram: { color: colors.primario, fontWeight: '700' },
  agregarRed: { color: colors.textoSecundario, textDecorationLine: 'underline' },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16, width: '100%' },
  boton: { flexGrow: 1, flexBasis: 140 },
  favoritos: {
    flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch', marginTop: 14,
    backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  presionado: { opacity: 0.8 },
  favoritosTexto: { flex: 1, color: colors.texto, fontSize: 16, fontWeight: '700' },
  favoritosCantidad: { color: colors.textoSecundario, fontSize: 15, fontWeight: '700' },
  baja: { marginTop: 8 },
  bajaTexto: { color: colors.peligro, fontSize: 14 },
  tituloLista: { color: colors.texto, fontSize: 17, fontWeight: '700', alignSelf: 'flex-start', marginTop: 24, marginBottom: 12 },
  vacio: { alignItems: 'center', gap: 14, padding: 20 },
  vacioTexto: { color: colors.textoSecundario },
});
