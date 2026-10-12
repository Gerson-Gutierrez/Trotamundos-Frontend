import React, { useState } from 'react';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import { authApi } from '../../api/authApi';
import { mensajeError } from '../../utils/formatters';
import { t } from '../../i18n';

export default function RestablecerPasswordScreen({ navigation }) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);

  const restablecer = async () => {
    if (!token.trim()) return setError(t('Ingresá el código que recibiste por email.'));
    if (password.length < 8) return setError(t('La contraseña debe tener al menos 8 caracteres.'));
    if (password !== confirmar) return setError(t('Las contraseñas no coinciden.'));
    setError('');
    setCargando(true);
    try {
      await authApi.resetearPassword(token.trim(), password);
      setListo(true);
    } catch (e) {
      setError(mensajeError(e, 'Código inválido o expirado.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo subtitulo="Pegá el código del email y elegí tu nueva contraseña.">Nueva contraseña</Titulo>

      <Mensaje texto={error} />
      {listo ? (
        <>
          <Mensaje tipo="exito" texto="¡Contraseña actualizada! Ya podés iniciar sesión." />
          <Button titulo="Ir al inicio de sesión" onPress={() => navigation.popToTop()} />
        </>
      ) : (
        <>
          <Input etiqueta="Código de recuperación" value={token} onChangeText={setToken}
            placeholder="Código recibido por email" autoCapitalize="none" autoCorrect={false} />
          <Input etiqueta="Nueva contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 8 caracteres" />
          <Input etiqueta="Confirmar contraseña" value={confirmar} onChangeText={setConfirmar} secureTextEntry placeholder="Repetí la contraseña" />
          <Button titulo="Cambiar contraseña" onPress={restablecer} cargando={cargando} />
        </>
      )}
    </Pantalla>
  );
}
