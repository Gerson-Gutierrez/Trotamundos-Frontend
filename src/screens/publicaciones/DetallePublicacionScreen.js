import React, { useCallback, useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Mensaje from '../../components/common/Mensaje';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Icono, { TextoIcono } from '../../components/common/Icono';
import SeccionAlojamiento from '../../components/publicacion/SeccionAlojamiento';
import SeccionGastronomia from '../../components/publicacion/SeccionGastronomia';
import SeccionRecomendaciones from '../../components/publicacion/SeccionRecomendaciones';
import GaleriaImagenes from '../../components/publicacion/GaleriaImagenes';
import { colors } from '../../constants/colors';
import { publicacionesApi } from '../../api/publicacionesApi';
import { reportesApi } from '../../api/reportesApi';
import { favoritosApi } from '../../api/favoritosApi';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../i18n';
import { formatearFecha, iniciales, mensajeError, nombrePais, urlImagen } from '../../utils/formatters';
import { avisar, confirmar } from '../../utils/dialogos';

const MOTIVOS = ['Spam', 'Contenido ofensivo', 'Ubicación falsa', 'Otro'];

export default function DetallePublicacionScreen({ route, navigation }) {
  const { id } = route.params;
  const { usuario, esAdmin } = useAuth();
  const [publicacion, setPublicacion] = useState(null);
  const [error, setError] = useState('');
  const [reportando, setReportando] = useState(false);
  const [guardada, setGuardada] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    publicacionesApi.obtener(id)
      .then(setPublicacion)
      .catch((e) => setError(mensajeError(e, 'No se encontró la publicación.')));
  }, [id]);

  const esAutor = publicacion && usuario && publicacion.usuarioId === usuario.usuarioId;
  // Solo se guardan publicaciones de otras personas (los administradores moderan, no coleccionan)
  const puedeGuardar = !!publicacion && !esAutor && !esAdmin;

  // ¿Ya está en favoritos?
  useEffect(() => {
    if (!puedeGuardar) return;
    let activo = true;
    favoritosApi.ids().then((ids) => activo && setGuardada(ids.includes(Number(id)))).catch(() => {});
    return () => { activo = false; };
  }, [puedeGuardar, id]);

  const alternarFavorito = useCallback(async () => {
    if (guardando) return;
    const quiere = !guardada;
    setGuardada(quiere); // se pinta enseguida; si el servidor falla se revierte
    setGuardando(true);
    try {
      await (quiere ? favoritosApi.guardar(id) : favoritosApi.quitar(id));
    } catch (e) {
      setGuardada(!quiere);
      avisar('Error', mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }, [guardada, guardando, id]);

  // Botón de favoritos en la esquina superior derecha; cambia de color cuando está guardada
  useEffect(() => {
    navigation.setOptions({
      headerRight: puedeGuardar
        ? () => (
          <Pressable onPress={alternarFavorito} hitSlop={12} style={styles.favorito}
            accessibilityRole="button"
            accessibilityLabel={t(guardada ? 'Quitar de favoritos' : 'Guardar en favoritos')}>
            <Icono nombre={guardada ? 'favoritoLleno' : 'favorito'} size={26} color={guardada ? colors.primario : colors.texto} />
          </Pressable>
        )
        : undefined,
    });
  }, [navigation, puedeGuardar, guardada, alternarFavorito]);

  const eliminar = async () => {
    const ok = await confirmar('Eliminar publicación', 'Esta acción no se puede deshacer.', { textoOk: 'Eliminar', destructivo: true });
    if (!ok) return;
    try {
      await publicacionesApi.eliminar(id);
      navigation.goBack();
    } catch (e) {
      avisar('Error', mensajeError(e));
    }
  };

  const abrirInstagram = (usuarioInstagram) => {
    Linking.openURL(`https://www.instagram.com/${usuarioInstagram}/`)
      .catch(() => avisar('No se pudo abrir la página', `instagram.com/${usuarioInstagram}`));
  };

  if (error) return <Pantalla><Mensaje texto={error} /></Pantalla>;
  if (!publicacion) return <LoadingSpinner />;

  const p = publicacion;

  return (
    <Pantalla bordes={[]}>
      <TextoIcono icono="ubicacion" size={24} color={colors.primario} style={styles.lugar} contenedorStyle={styles.lugarFila}>
        {p.nombreCiudad}, {nombrePais(p.codigoIsoPais, p.nombrePais)}
      </TextoIcono>

      <View style={styles.autor}>
        {p.fotoPerfilUrl ? (
          <Image source={{ uri: urlImagen(p.fotoPerfilUrl) }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarVacio]}>
            <Text style={styles.avatarIniciales}>{iniciales(p.nombreUsuario)}</Text>
          </View>
        )}
        <View style={styles.autorDatos}>
          <Text style={styles.autorNombre}>{p.nombreUsuario}</Text>
          <Text style={styles.fecha}>{formatearFecha(p.fechaPublicacion)}</Text>
        </View>
        {p.instagramUsuario ? (
          <Pressable onPress={() => abrirInstagram(p.instagramUsuario)} hitSlop={8} style={styles.instagram}
            accessibilityRole="link" accessibilityLabel={`Instagram @${p.instagramUsuario}`}>
            <Icono nombre="instagram" size={18} color={colors.primario} />
            <Text style={styles.instagramTexto} numberOfLines={1}>@{p.instagramUsuario}</Text>
          </Pressable>
        ) : null}
      </View>

      <GaleriaImagenes imagenes={p.imagenes} />
      <SeccionAlojamiento alojamiento={p.alojamiento} />
      <SeccionGastronomia gastronomia={p.experienciaGastronomica} />
      <SeccionRecomendaciones recomendacion={p.recomendacion} />

      <View style={styles.acciones}>
        {(esAutor || esAdmin) && (
          <Button titulo="Eliminar publicación" variant="peligro" onPress={eliminar} />
        )}
        {!esAutor && !esAdmin && (
          <Button titulo="Denunciar publicación" variant="secundario" icono="denuncia" onPress={() => setReportando(true)} />
        )}
      </View>

      <ModalReporte visible={reportando} publicacionId={id} onCerrar={() => setReportando(false)} />
    </Pantalla>
  );
}

function ModalReporte({ visible, publicacionId, onCerrar }) {
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [detalle, setDetalle] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setError('');
    setCargando(true);
    try {
      // El motivo viaja siempre en español (así lo guarda el panel de moderación)
      await reportesApi.denunciar(publicacionId, motivo, detalle.trim() || null);
      onCerrar();
      avisar('Gracias', 'Tu denuncia fue registrada y será revisada por el equipo de moderación.');
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView style={styles.fondoModal} behavior="padding">
        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled" bounces={false}>
          <Text style={styles.modalTitulo}>{t('Denunciar publicación')}</Text>
          <Mensaje texto={error} />
          <View style={styles.motivos}>
            {MOTIVOS.map((m) => (
              <Pressable key={m} onPress={() => setMotivo(m)} style={[styles.motivo, motivo === m && styles.motivoActivo]}>
                <Text style={[styles.motivoTexto, motivo === m && styles.motivoTextoActivo]}>{t(m)}</Text>
              </Pressable>
            ))}
          </View>
          <Input etiqueta="Detalle (opcional)" value={detalle} onChangeText={setDetalle} multiline
            placeholder="Contanos qué problema tiene esta publicación" />
          <Button titulo="Enviar denuncia" onPress={enviar} cargando={cargando} />
          <Button titulo="Cancelar" variant="texto" onPress={onCerrar} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  lugarFila: { marginBottom: 12 },
  lugar: { color: colors.primario, fontSize: 22, fontWeight: '800' },
  favorito: { paddingHorizontal: 4, paddingVertical: 4 },
  autor: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  autorDatos: { flex: 1, minWidth: 0 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.superficieClara },
  avatarVacio: { alignItems: 'center', justifyContent: 'center' },
  avatarIniciales: { color: colors.primario, fontWeight: '800' },
  autorNombre: { color: colors.texto, fontWeight: '700', fontSize: 15 },
  fecha: { color: colors.textoSecundario, fontSize: 12 },
  instagram: {
    flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '45%',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde,
  },
  instagramTexto: { color: colors.primario, fontSize: 12, fontWeight: '700', flexShrink: 1 },
  acciones: { gap: 10, marginTop: 10 },
  fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalScroll: { flexGrow: 0, maxHeight: '90%', backgroundColor: colors.superficie, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modal: { padding: 20, paddingBottom: 36 },
  modalTitulo: { color: colors.texto, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  motivos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  motivo: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.borde },
  motivoActivo: { backgroundColor: colors.primario, borderColor: colors.primario },
  motivoTexto: { color: colors.texto, fontSize: 13 },
  motivoTextoActivo: { color: colors.fondo, fontWeight: '700' },
});
