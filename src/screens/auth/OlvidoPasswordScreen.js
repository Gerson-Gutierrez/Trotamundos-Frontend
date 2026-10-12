import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import { authApi } from '../../api/authApi';
import { mensajeError } from '../../utils/formatters';
import { t } from '../../i18n';

export default function OlvidoPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    if (!email.trim()) return setError(t('Ingresá tu email.'));
    setError('');
    setCargando(true);
    try {
      await authApi.solicitarRecuperacion(email.trim());
      setEnviado(true);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo subtitulo="Te enviamos un código por email para que elijas una nueva contraseña.">
        ¿Olvidaste tu contraseña?
      </Titulo>

      <Mensaje texto={error} />
      <Text style={styles.nota}>
        {t('Si tu cuenta es de administrador, la contraseña la restablece un superadministrador.')}
      </Text>
      {enviado && (
        <Mensaje tipo="exito" texto="Si el correo está registrado, vas a recibir un código. Revisá tu bandeja de entrada." />
      )}

      <Input etiqueta="Email" value={email} onChangeText={setEmail} placeholder="tu@email.com"
        autoCapitalize="none" keyboardType="email-address" editable={!enviado} />

      {!enviado ? (
        <>
          <Button titulo="Enviar código" onPress={enviar} cargando={cargando} />
          <Button titulo="Ya tengo un código" variant="texto" onPress={() => navigation.navigate('RestablecerPassword', { email })} />
        </>
      ) : (
        <Button titulo="Ingresar el código" onPress={() => navigation.navigate('RestablecerPassword', { email })} />
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  nota: { color: colors.textoSecundario, fontSize: 12, marginBottom: 12 },
});
