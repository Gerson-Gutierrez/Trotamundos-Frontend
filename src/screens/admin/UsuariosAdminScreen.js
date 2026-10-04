import React, { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../constants/colors';
import { usuariosApi } from '../../api/usuariosApi';
import { useAuth } from '../../hooks/useAuth';
import { formatearFecha, iniciales, mensajeError, urlImagen } from '../../utils/formatters';
import { avisar, confirmar } from '../../utils/dialogos';

export default function UsuariosAdminScreen() {
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    usuariosApi.listar().then(setUsuarios).catch(() => {}).finally(() => setCargando(false));
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const alternarBloqueo = async (u) => {
    const accion = u.bloqueado ? 'desbloquear' : 'bloquear';
    if (!(await confirmar('Confirmar', `¿Querés ${accion} a ${u.nombre} ${u.apellido}?`, { textoOk: 'Sí', destructivo: !u.bloqueado }))) return;
    try {
      await (u.bloqueado ? usuariosApi.desbloquear(u.usuarioId) : usuariosApi.bloquear(u.usuarioId));
      cargar();
    } catch (e) {
      avisar('Error', mensajeError(e));
    }
  };

  const eliminar = async (u) => {
    if (!(await confirmar('Eliminar usuario', `¿Eliminar a ${u.nombre} ${u.apellido}? Se borrarán también todas sus publicaciones. No se puede deshacer.`, { textoOk: 'Eliminar', destructivo: true }))) return;
    try {
      await usuariosApi.eliminar(u.usuarioId);
      cargar();
    } catch (e) {
      avisar('Error', mensajeError(e));
    }
  };

  if (cargando) return <LoadingSpinner />;

  return (
    <FlatList
      data={usuarios}
      keyExtractor={(u) => String(u.usuarioId)}
      contentContainerStyle={styles.lista}
      style={{ backgroundColor: colors.fondo }}
      renderItem={({ item: u }) => (
        <View style={[styles.item, u.bloqueado && styles.itemBloqueado]}>
          <View style={styles.fila}>
            {u.fotoPerfilUrl ? (
              <Image source={{ uri: urlImagen(u.fotoPerfilUrl) }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarVacio]}><Text style={styles.iniciales}>{iniciales(`${u.nombre} ${u.apellido}`)}</Text></View>
            )}
            <View style={styles.info}>
              <Text style={styles.nombre}>{u.nombre} {u.apellido} {u.esAdmin ? '🛡️' : ''}{u.bloqueado ? ' 🚫' : ''}</Text>
              <Text style={styles.dato}>{u.email}</Text>
              <Text style={styles.dato}>{u.nacionalidad} · desde {formatearFecha(u.fechaRegistro)}</Text>
            </View>
          </View>
          {u.usuarioId !== yo?.usuarioId && (
            <View style={styles.acciones}>
              {!u.esAdmin && (
                <Button titulo={u.bloqueado ? 'Desbloquear' : 'Bloquear'} variant={u.bloqueado ? 'secundario' : 'peligro'}
                  onPress={() => alternarBloqueo(u)} style={styles.boton} />
              )}
              {!u.esAdmin && <Button titulo="Eliminar" variant="peligro" onPress={() => eliminar(u)} style={styles.boton} />}
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 14, width: '100%', maxWidth: 720, alignSelf: 'center' },
  item: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 12, padding: 12, marginBottom: 10 },
  itemBloqueado: { borderColor: colors.peligro, opacity: 0.8 },
  fila: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  info: { flex: 1, minWidth: 0 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.superficieClara, flexShrink: 0 },
  avatarVacio: { alignItems: 'center', justifyContent: 'center' },
  iniciales: { color: colors.primario, fontWeight: '800' },
  nombre: { color: colors.texto, fontWeight: '700', fontSize: 15 },
  dato: { color: colors.textoSecundario, fontSize: 12 },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  boton: { flexGrow: 1, flexBasis: 130, minHeight: 40, paddingVertical: 8 },
});
