import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import Input from './Input';
import Mensaje from './Mensaje';
import { colors } from '../../constants/colors';
import { authApi } from '../../api/authApi';
import { mensajeError } from '../../utils/formatters';
import { t } from '../../i18n';

// Pide la contraseña y da de baja la cuenta. Llama a onEliminada() cuando el servidor confirma.
export default function ModalEliminarCuenta({ visible, onCerrar, onEliminada }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cerrar = () => {
    if (cargando) return;
    setPassword('');
    setError('');
    onCerrar();
  };

  const eliminar = async () => {
    if (!password) { setError(t('Ingresá tu contraseña para confirmar.')); return; }
    setError('');
    setCargando(true);
    try {
      await authApi.eliminarCuenta(password);
      setPassword('');
      onEliminada();
    } catch (e) {
      setError(mensajeError(e));
      setCargando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cerrar}>
      <KeyboardAvoidingView style={styles.fondo} behavior="padding">
        <View style={styles.caja}>
          <Text style={styles.titulo}>{t('Eliminar mi cuenta')}</Text>
          <Text style={styles.texto}>
            {t('Se borrarán tu perfil y todas tus publicaciones. Esta acción no se puede deshacer.')}
          </Text>
          <Mensaje texto={error} />
          <Input
            etiqueta="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Tu contraseña actual"
            onSubmitEditing={eliminar}
          />
          <View style={styles.acciones}>
            <Button titulo="Cancelar" variant="secundario" onPress={cerrar} deshabilitado={cargando} style={styles.boton} />
            <Button titulo="Eliminar cuenta" variant="peligro" onPress={eliminar} cargando={cargando} style={styles.boton} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  caja: { width: '100%', maxWidth: 420, backgroundColor: colors.superficie, borderRadius: 16, borderWidth: 1, borderColor: colors.borde, padding: 20 },
  titulo: { color: colors.texto, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  texto: { color: colors.textoSecundario, fontSize: 14, marginBottom: 14 },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  boton: { flexGrow: 1, flexBasis: 140 },
});
