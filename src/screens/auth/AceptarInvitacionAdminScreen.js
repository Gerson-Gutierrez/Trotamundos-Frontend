import React, { useState } from 'react';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import { authApi } from '../../api/authApi';
import { mensajeError } from '../../utils/formatters';
import { t } from '../../i18n';

// Se abre desde el enlace del correo (…/admin/register?token=XYZ); el token también puede pegarse a mano.
export default function AceptarInvitacionAdminScreen({ route, navigation }) {
  const [token, setToken] = useState(route.params?.token || '');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);

  const aceptar = async () => {
    if (!token.trim()) return setError(t('Ingresá el código de la invitación.'));
    if (!nombre.trim()) return setError(t('Ingresá tu nombre completo.'));
    if (password.length < 8) return setError(t('La contraseña debe tener al menos 8 caracteres.'));
    if (password !== confirmar) return setError(t('Las contraseñas no coinciden.'));
    setError('');
    setCargando(true);
    try {
      await authApi.aceptarInvitacionAdmin(token.trim(), nombre.trim(), password);
      setListo(true);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo subtitulo="Completá tus datos para crear tu cuenta.">Aceptar invitación</Titulo>

      <Mensaje texto={error} />
      {listo ? (
        <>
          <Mensaje tipo="exito" texto="¡Cuenta creada! Ya podés iniciar sesión." />
          <Button titulo="Ir al inicio de sesión" onPress={() => navigation.navigate('Login')} />
        </>
      ) : (
        <>
          <Input etiqueta="Código de invitación" value={token} onChangeText={setToken}
            placeholder="Código del enlace" autoCapitalize="none" autoCorrect={false} />
          <Input etiqueta="Nombre completo" value={nombre} onChangeText={setNombre} placeholder="Nombre y apellido" />
          <Input etiqueta="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 8 caracteres" />
          <Input etiqueta="Confirmar contraseña" value={confirmar} onChangeText={setConfirmar} secureTextEntry placeholder="Repetí la contraseña" />
          <Button titulo="Crear cuenta" onPress={aceptar} cargando={cargando} />
        </>
      )}
    </Pantalla>
  );
}
