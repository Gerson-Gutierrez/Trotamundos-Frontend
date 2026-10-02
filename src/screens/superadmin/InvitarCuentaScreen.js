import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import { colors } from '../../constants/colors';
import { superAdminApi } from '../../api/superAdminApi';
import { mensajeError } from '../../utils/formatters';

export default function InvitarCuentaScreen() {
  const [email, setEmail] = useState('');
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const invitar = async () => {
    if (!email.trim()) return setError('Ingresá el email de la persona a invitar.');
    setError('');
    setExito('');
    setCargando(true);
    try {
      const r = await superAdminApi.invitar(email.trim(), esSuperAdmin);
      setExito(r?.mensaje || 'Invitación enviada.');
      setEmail('');
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo subtitulo="Se enviará un enlace de un solo uso que vence en 24 horas.">Enviar invitación</Titulo>
      <Mensaje texto={error} />
      <Mensaje tipo="exito" texto={exito} />

      <Text style={styles.etiqueta}>Rol de la nueva cuenta</Text>
      <View style={styles.roles}>
        <Button titulo="Administrador" variant={esSuperAdmin ? 'secundario' : 'primario'} onPress={() => setEsSuperAdmin(false)} style={styles.rol} />
        <Button titulo="Superadministrador" variant={esSuperAdmin ? 'primario' : 'secundario'} onPress={() => setEsSuperAdmin(true)} style={styles.rol} />
      </View>

      <Input etiqueta="Email" value={email} onChangeText={setEmail} placeholder="nueva_cuenta@correo.com"
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Button titulo="Enviar invitación" onPress={invitar} cargando={cargando} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  etiqueta: { color: colors.textoSecundario, fontSize: 13, marginBottom: 6 },
  roles: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  rol: { flex: 1, minHeight: 44, paddingVertical: 8, paddingHorizontal: 8 },
});
