import React, { useState } from 'react';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import SelectorImagen from '../../components/common/SelectorImagen';
import SelectorPais from '../../components/common/SelectorPais';
import { archivosApi } from '../../api/archivosApi';
import { useAuth } from '../../hooks/useAuth';
import { mensajeError, normalizarInstagram } from '../../utils/formatters';
import { t } from '../../i18n';

export default function RegisterScreen() {
  const { registro } = useAuth();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', confirmar: '', instagram: '' });
  const [nacionalidad, setNacionalidad] = useState(null);
  const [foto, setFoto] = useState(null); // asset local
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cambiar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const validar = () => {
    if (!form.nombre.trim() || !form.apellido.trim()) return 'Ingresá tu nombre y apellido.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Ingresá un email válido.';
    if (form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (form.password !== form.confirmar) return 'Las contraseñas no coinciden.';
    if (!nacionalidad) return 'Elegí tu nacionalidad.';
    // La red social es opcional, pero si se escribe tiene que ser válida
    return normalizarInstagram(form.instagram).error || '';
  };

  const registrarse = async () => {
    const msg = validar();
    if (msg) return setError(t(msg));
    setError('');
    setCargando(true);
    try {
      // 1) Subir la foto (opcional) 2) Registrar con la URL devuelta
      let fotoPerfilUrl = null;
      if (foto) fotoPerfilUrl = (await archivosApi.subirFotoPerfil(foto)).url;

      await registro({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password,
        nacionalidad: nacionalidad.nombre,
        fotoPerfilUrl,
        instagram: normalizarInstagram(form.instagram).usuario,
      });
      // Al guardarse la sesión, AppNavigator cambia solo a la app
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo subtitulo="Contanos quién sos para empezar a compartir tus viajes">Crear cuenta</Titulo>

      <SelectorImagen uri={foto?.uri} onSeleccion={setFoto} etiqueta={foto ? 'Cambiar foto' : 'Foto de perfil'} />
      <Mensaje texto={error} />

      <Input etiqueta="Nombre" value={form.nombre} onChangeText={cambiar('nombre')} placeholder="Ana" />
      <Input etiqueta="Apellido" value={form.apellido} onChangeText={cambiar('apellido')} placeholder="Pérez" />
      <Input etiqueta="Email" value={form.email} onChangeText={cambiar('email')} placeholder="tu@email.com"
        autoCapitalize="none" keyboardType="email-address" />
      <SelectorPais etiqueta="Nacionalidad" valor={nacionalidad} onSeleccion={setNacionalidad} placeholder="Elegí tu país" />
      <Input etiqueta="Instagram (opcional)" value={form.instagram} onChangeText={cambiar('instagram')} placeholder="@tu_usuario"
        autoCapitalize="none" autoCorrect={false} />
      <Input etiqueta="Contraseña" value={form.password} onChangeText={cambiar('password')} placeholder="Mínimo 8 caracteres" secureTextEntry />
      <Input etiqueta="Confirmar contraseña" value={form.confirmar} onChangeText={cambiar('confirmar')} placeholder="Repetí la contraseña" secureTextEntry />

      <Button titulo="Registrarme" onPress={registrarse} cargando={cargando} />
    </Pantalla>
  );
}
