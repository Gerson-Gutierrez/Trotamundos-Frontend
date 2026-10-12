import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../constants/colors';
import { superAdminApi } from '../../api/superAdminApi';
import { useAuth } from '../../hooks/useAuth';
import { formatearFecha, mensajeError } from '../../utils/formatters';
import { avisar, confirmar } from '../../utils/dialogos';
import { t } from '../../i18n';
import Icono from '../../components/common/Icono';

export default function CuentasAdminScreen() {
  const { usuario: yo } = useAuth();
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    superAdminApi.cuentas().then(setCuentas).catch(() => {}).finally(() => setCargando(false));
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const recuperar = async (c) => {
    if (!(await confirmar('Recuperar contraseña', t('Se enviará un código de recuperación a {email}.', { email: c.email }), { textoOk: 'Enviar' }))) return;
    try {
      const r = await superAdminApi.recuperarPassword(c.usuarioId);
      avisar('Listo', r?.mensaje);
    } catch (e) {
      avisar('Error', mensajeError(e));
    }
  };

  const eliminar = async (c) => {
    if (!(await confirmar('Eliminar administrador', t('¿Eliminar a {nombre}? Su correo ({email}) quedará bloqueado y no podrá volver a registrarse.', { nombre: `${c.nombre} ${c.apellido}`, email: c.email }), { textoOk: 'Eliminar', destructivo: true }))) return;
    try {
      await superAdminApi.eliminarAdministrador(c.usuarioId);
      cargar();
    } catch (e) {
      avisar('Error', mensajeError(e));
    }
  };

  if (cargando) return <LoadingSpinner />;

  return (
    <FlatList
      data={cuentas}
      keyExtractor={(c) => String(c.usuarioId)}
      contentContainerStyle={styles.lista}
      style={{ backgroundColor: colors.fondo }}
      ListEmptyComponent={<Text style={styles.vacio}>{t('No hay cuentas administrativas.')}</Text>}
      renderItem={({ item: c }) => (
        <View style={styles.item}>
          <View style={styles.nombreFila}>
            <Icono nombre={c.esSuperAdmin ? 'superadmin' : 'admin'} size={18} color={colors.advertencia} />
            <Text style={styles.nombre}>{c.nombre} {c.apellido}{c.usuarioId === yo?.usuarioId ? ` ${t('(vos)')}` : ''}</Text>
          </View>
          <Text style={styles.dato}>{c.email}</Text>
          <Text style={styles.dato}>{t('{rol} · desde {fecha}', { rol: t(c.esSuperAdmin ? 'Superadministrador' : 'Administrador'), fecha: formatearFecha(c.fechaRegistro) })}</Text>
          <View style={styles.acciones}>
            <Button titulo="Recuperar contraseña" variant="secundario" onPress={() => recuperar(c)} style={styles.boton} />
            {!c.esSuperAdmin && <Button titulo="Eliminar" variant="peligro" onPress={() => eliminar(c)} style={styles.boton} />}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 14, width: '100%', maxWidth: 720, alignSelf: 'center' },
  vacio: { color: colors.textoSecundario, textAlign: 'center', marginTop: 24 },
  item: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 12, padding: 12, marginBottom: 10 },
  nombreFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nombre: { color: colors.texto, fontWeight: '700', fontSize: 15, flexShrink: 1 },
  dato: { color: colors.textoSecundario, fontSize: 12, marginTop: 2 },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  boton: { flexGrow: 1, flexBasis: 130, minHeight: 40, paddingVertical: 8 },
});
