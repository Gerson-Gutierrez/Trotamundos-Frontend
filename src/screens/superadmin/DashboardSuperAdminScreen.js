import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Button from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { confirmar } from '../../utils/dialogos';
import { t } from '../../i18n';
import Icono, { TextoIcono } from '../../components/common/Icono';
import BotonIdioma from '../../components/common/BotonIdioma';

export default function DashboardSuperAdminScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  const cerrarSesion = async () => {
    if (await confirmar('Cerrar sesión', '¿Querés salir de tu cuenta?', { textoOk: 'Salir', destructivo: true })) logout();
  };

  return (
    <Pantalla>
      <View style={styles.barraSuperior}>
        <BotonIdioma />
      </View>
      <TextoIcono icono="superadmin" size={16} color={colors.advertencia} style={styles.rol} contenedorStyle={styles.rolFila}>
        {t('SUPERADMINISTRADOR')}
      </TextoIcono>
      <Titulo subtitulo={usuario?.email}>Panel de superadministración</Titulo>

      <Opcion icono="admin" texto="Administradores y superadministradores" onPress={() => navigation.navigate('CuentasAdmin')} />
      <Opcion icono="correo" texto="Enviar invitación" onPress={() => navigation.navigate('InvitarCuenta')} />
      <Opcion icono="bloqueado" texto="Correos bloqueados" onPress={() => navigation.navigate('CorreosBloqueados')} />

      <Button titulo="Cerrar sesión" variant="secundario" onPress={cerrarSesion} style={styles.salir} />
    </Pantalla>
  );
}

function Opcion({ icono, texto, onPress }) {
  return (
    <Pressable style={styles.opcion} onPress={onPress}>
      <Icono nombre={icono} size={22} color={colors.advertencia} />
      <Text style={styles.opcionTexto}>{t(texto)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  barraSuperior: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  rolFila: { marginBottom: 6 },
  rol: { color: colors.advertencia, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.advertencia, borderRadius: 12, padding: 16, marginBottom: 10 },
  opcionTexto: { color: colors.texto, fontWeight: '600', fontSize: 15, flexShrink: 1 },
  salir: { marginTop: 24 },
});
