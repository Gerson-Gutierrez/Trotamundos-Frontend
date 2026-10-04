/*
import React, { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import TarjetaPublicacion from '../../components/publicacion/TarjetaPublicacion';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../constants/colors';
import { publicacionesApi } from '../../api/publicacionesApi';
import { useAuth } from '../../hooks/useAuth';
import { iniciales, urlImagen } from '../../utils/formatters';
import { confirmar } from '../../utils/dialogos';

export default function PerfilScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(useCallback(() => {
    let activo = true;
    publicacionesApi.mias()
      .then((d) => activo && setPublicaciones(d))
      .catch(() => {})
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []));

  const cerrarSesion = async () => {
    if (await confirmar('Cerrar sesión', '¿Querés salir de tu cuenta?', { textoOk: 'Salir', destructivo: true })) logout();
  };

  const cabecera = (
    <View style={styles.cabecera}>
      {usuario?.fotoPerfilUrl ? (
        <Image source={{ uri: urlImagen(usuario.fotoPerfilUrl) }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarVacio]}>
          <Text style={styles.avatarIniciales}>{iniciales(`${usuario?.nombre} ${usuario?.apellido}`)}</Text>
        </View>
      )}
      <Text style={styles.nombre}>{usuario?.nombre} {usuario?.apellido}</Text>
      <Text style={styles.dato}>{usuario?.email}</Text>
      <Text style={styles.dato}>🌐 {usuario?.nacionalidad}{usuario?.esAdmin ? '  ·  🛡️ Administrador' : ''}</Text>

      <View style={styles.acciones}>
        <Button titulo="Editar perfil" variant="secundario" onPress={() => navigation.navigate('EditarPerfil')} style={styles.boton} />
        <Button titulo="Cerrar sesión" variant="secundario" onPress={cerrarSesion} style={styles.boton} />
      </View>

      <Text style={styles.tituloLista}>Mis publicaciones ({publicaciones.length})</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={publicaciones}
        keyExtractor={(p) => String(p.publicacionId)}
        ListHeaderComponent={cabecera}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={cargando ? <LoadingSpinner pantallaCompleta={false} /> : (
          <View style={styles.vacio}>
            <Text style={styles.vacioTexto}>Todavía no publicaste ningún viaje.</Text>
            <Button titulo="Crear mi primera publicación" onPress={() => navigation.navigate('Wizard')} />
          </View>
        )}
        renderItem={({ item }) => (
          <TarjetaPublicacion publicacion={item}
            onPress={() => navigation.navigate('DetallePublicacion', { id: item.publicacionId })} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  lista: { padding: 20, paddingBottom: 40 },
  cabecera: { alignItems: 'center', marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.superficieClara, borderWidth: 2, borderColor: colors.primario },
  avatarVacio: { alignItems: 'center', justifyContent: 'center' },
  avatarIniciales: { color: colors.primario, fontSize: 32, fontWeight: '800' },
  nombre: { color: colors.texto, fontSize: 22, fontWeight: '800', marginTop: 12 },
  dato: { color: colors.textoSecundario, marginTop: 4 },
  acciones: { flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' },
  boton: { flex: 1 },
  tituloLista: { color: colors.texto, fontSize: 17, fontWeight: '700', alignSelf: 'flex-start', marginTop: 24, marginBottom: 12 },
  vacio: { alignItems: 'center', gap: 14, padding: 20 },
  vacioTexto: { color: colors.textoSecundario },
});
*/


import React, { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import TarjetaPublicacion from '../../components/publicacion/TarjetaPublicacion';
import Button from '../../components/common/Button';
import ModalEliminarCuenta from '../../components/common/ModalEliminarCuenta';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../constants/colors';
import { publicacionesApi } from '../../api/publicacionesApi';
import { useAuth } from '../../hooks/useAuth';
import { iniciales, urlImagen } from '../../utils/formatters';
import { avisar, confirmar } from '../../utils/dialogos';

export default function PerfilScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modalBaja, setModalBaja] = useState(false);

  const esAdmin = Boolean(usuario?.esAdmin);
  // Solo los usuarios comunes pueden darse de baja; los administradores se gestionan aparte
  const puedeEliminarCuenta = !esAdmin && !usuario?.esSuperAdmin;

  useFocusEffect(useCallback(() => {
    let activo = true;

    // Si es admin, no consultamos sus publicaciones
    if (esAdmin) {
      setCargando(false);
      return;
    }

    publicacionesApi.mias()
      .then((d) => activo && setPublicaciones(d))
      .catch(() => {})
      .finally(() => activo && setCargando(false));

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

  const cabecera = (
    <View style={styles.cabecera}>
      {usuario?.fotoPerfilUrl ? (
        <Image source={{ uri: urlImagen(usuario.fotoPerfilUrl) }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarVacio]}>
          <Text style={styles.avatarIniciales}>{iniciales(`${usuario?.nombre} ${usuario?.apellido}`)}</Text>
        </View>
      )}
      <Text style={styles.nombre}>{usuario?.nombre} {usuario?.apellido}</Text>
      <Text style={styles.dato}>{usuario?.email}</Text>
      <Text style={styles.dato}>🌐 {usuario?.nacionalidad}{esAdmin ? '  ·  🛡️ Administrador' : ''}</Text>

      <View style={styles.acciones}>
        <Button titulo="Editar perfil" variant="secundario" onPress={() => navigation.navigate('EditarPerfil')} style={styles.boton} />
        <Button titulo="Cerrar sesión" variant="secundario" onPress={cerrarSesion} style={styles.boton} />
      </View>

      {puedeEliminarCuenta && (
        <Button titulo="Eliminar mi cuenta" variant="texto" onPress={() => setModalBaja(true)}
          style={styles.baja} textoStyle={styles.bajaTexto} />
      )}

      {/* Solo se muestra la sección de publicaciones si NO es admin */}
      {!esAdmin && (
        <Text style={styles.tituloLista}>Mis publicaciones ({publicaciones.length})</Text>
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
                <Text style={styles.vacioTexto}>Todavía no publicaste ningún viaje.</Text>
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
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.superficieClara, borderWidth: 2, borderColor: colors.primario },
  avatarVacio: { alignItems: 'center', justifyContent: 'center' },
  avatarIniciales: { color: colors.primario, fontSize: 32, fontWeight: '800' },
  nombre: { color: colors.texto, fontSize: 22, fontWeight: '800', marginTop: 12 },
  dato: { color: colors.textoSecundario, marginTop: 4 },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16, width: '100%' },
  boton: { flexGrow: 1, flexBasis: 140 },
  baja: { marginTop: 8 },
  bajaTexto: { color: colors.peligro, fontSize: 14 },
  tituloLista: { color: colors.texto, fontSize: 17, fontWeight: '700', alignSelf: 'flex-start', marginTop: 24, marginBottom: 12 },
  vacio: { alignItems: 'center', gap: 14, padding: 20 },
  vacioTexto: { color: colors.textoSecundario },
});