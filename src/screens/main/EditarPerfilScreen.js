import React, { useState } from 'react';
import Pantalla from '../../components/common/Pantalla';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import SelectorImagen from '../../components/common/SelectorImagen';
import SelectorPais from '../../components/common/SelectorPais';
import { archivosApi } from '../../api/archivosApi';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { mensajeError, normalizarInstagram, urlImagen } from '../../utils/formatters';
import { t } from '../../i18n';

export default function EditarPerfilScreen({ navigation }) {
  const { usuario, actualizarUsuario } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [apellido, setApellido] = useState(usuario?.apellido || '');
  const [nacionalidad, setNacionalidad] = useState(usuario?.nacionalidad ? { nombre: usuario.nacionalidad } : null);
  const [instagram, setInstagram] = useState(usuario?.instagramUsuario ? `@${usuario.instagramUsuario}` : '');
  const [fotoNueva, setFotoNueva] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const guardar = async () => {
    if (!nombre.trim() || !apellido.trim()) return setError(t('Nombre y apellido son obligatorios.'));
    // Opcional: vacío quita la red social; si hay texto tiene que ser un usuario válido
    const red = normalizarInstagram(instagram);
    if (red.error) return setError(t(red.error));
    setError('');
    setCargando(true);
    try {
      let fotoPerfilUrl = usuario?.fotoPerfilUrl || null;
      if (fotoNueva) fotoPerfilUrl = (await archivosApi.subirFotoPerfil(fotoNueva)).url;

      const perfil = await authApi.actualizarPerfil({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        nacionalidad: nacionalidad?.nombre || usuario.nacionalidad,
        fotoPerfilUrl,
        instagram: red.usuario,
      });
      await actualizarUsuario(perfil);
      navigation.goBack();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <SelectorImagen
        uri={fotoNueva?.uri || urlImagen(usuario?.fotoPerfilUrl)}
        onSeleccion={setFotoNueva}
        etiqueta="Cambiar foto"
      />
      <Mensaje texto={error} />
      <Input etiqueta="Nombre" value={nombre} onChangeText={setNombre} />
      <Input etiqueta="Apellido" value={apellido} onChangeText={setApellido} />
      <SelectorPais etiqueta="Nacionalidad" valor={nacionalidad} onSeleccion={setNacionalidad} />
      <Input etiqueta="Instagram (opcional)" value={instagram} onChangeText={setInstagram} placeholder="@tu_usuario"
        autoCapitalize="none" autoCorrect={false} />
      <Input etiqueta="Email" value={usuario?.email} editable={false} style={{ opacity: 0.6 }} />
      <Button titulo="Guardar cambios" onPress={guardar} cargando={cargando} />
    </Pantalla>
  );
}
