import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Button from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { confirmar } from '../../utils/dialogos';

export default function DashboardSuperAdminScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  const cerrarSesion = async () => {
    if (await confirmar('Cerrar sesión', '¿Querés salir de tu cuenta?', { textoOk: 'Salir', destructivo: true })) logout();
  };

  return (
    <Pantalla>
      <Text style={styles.rol}>👑 SUPERADMINISTRADOR</Text>
      <Titulo subtitulo={usuario?.email}>Panel de superadministración</Titulo>

      <Opcion texto="🛡️ Administradores y superadministradores" onPress={() => navigation.navigate('CuentasAdmin')} />
      <Opcion texto="✉️ Enviar invitación" onPress={() => navigation.navigate('InvitarCuenta')} />
      <Opcion texto="🚫 Correos bloqueados" onPress={() => navigation.navigate('CorreosBloqueados')} />

      <Button titulo="Cerrar sesión" variant="secundario" onPress={cerrarSesion} style={styles.salir} />
    </Pantalla>
  );
}

function Opcion({ texto, onPress }) {
  return (
    <Pressable style={styles.opcion} onPress={onPress}>
      <Text style={styles.opcionTexto}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rol: { color: colors.advertencia, fontWeight: '800', fontSize: 12, letterSpacing: 1, marginBottom: 6 },
  opcion: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.advertencia, borderRadius: 12, padding: 16, marginBottom: 10 },
  opcionTexto: { color: colors.texto, fontWeight: '600', fontSize: 15 },
  salir: { marginTop: 24 },
});
