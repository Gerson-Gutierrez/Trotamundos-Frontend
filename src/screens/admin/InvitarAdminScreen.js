import React, { useState } from 'react';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import { authApi } from '../../api/authApi';
import { mensajeError } from '../../utils/formatters';

export default function InvitarAdminScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const invitar = async () => {
    if (!email.trim()) return setError('Ingresá el email de la persona a invitar.');
    setError('');
    setExito('');
    setCargando(true);
    try {
      const r = await authApi.invitarAdmin(email.trim());
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
      <Titulo subtitulo="Se enviará un enlace de un solo uso que vence en 24 horas.">Invitar administrador</Titulo>
      <Mensaje texto={error} />
      <Mensaje tipo="exito" texto={exito} />
      <Input etiqueta="Email" value={email} onChangeText={setEmail} placeholder="nuevo_admin@correo.com"
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Button titulo="Enviar invitación" onPress={invitar} cargando={cargando} />
    </Pantalla>
  );
}
