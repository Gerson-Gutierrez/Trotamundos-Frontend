import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Mensaje from '../../components/common/Mensaje';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SeccionAlojamiento from '../../components/publicacion/SeccionAlojamiento';
import SeccionGastronomia from '../../components/publicacion/SeccionGastronomia';
import SeccionRecomendaciones from '../../components/publicacion/SeccionRecomendaciones';
import GaleriaImagenes from '../../components/publicacion/GaleriaImagenes';
import { colors } from '../../constants/colors';
import { publicacionesApi } from '../../api/publicacionesApi';
import { reportesApi } from '../../api/reportesApi';
import { useAuth } from '../../hooks/useAuth';
import { formatearFecha, iniciales, mensajeError, urlImagen } from '../../utils/formatters';
import { avisar, confirmar } from '../../utils/dialogos';

const MOTIVOS = ['Spam', 'Contenido ofensivo', 'Ubicación falsa', 'Otro'];

export default function DetallePublicacionScreen({ route, navigation }) {
  const { id } = route.params;
  const { usuario, esAdmin } = useAuth();
  const [publicacion, setPublicacion] = useState(null);
  const [error, setError] = useState('');
  const [reportando, setReportando] = useState(false);

  useEffect(() => {
    publicacionesApi.obtener(id)
      .then(setPublicacion)
      .catch((e) => setError(mensajeError(e, 'No se encontró la publicación.')));
  }, [id]);

  const esAutor = publicacion && usuario && publicacion.usuarioId === usuario.usuarioId;

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

  if (error) return <Pantalla><Mensaje texto={error} /></Pantalla>;
  if (!publicacion) return <LoadingSpinner />;

  const p = publicacion;

  return (
    <Pantalla bordes={[]}>
      <Text style={styles.lugar}>📍 {p.nombreCiudad}, {p.nombrePais}</Text>

      <View style={styles.autor}>
        {p.fotoPerfilUrl ? (
          <Image source={{ uri: urlImagen(p.fotoPerfilUrl) }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarVacio]}>
            <Text style={styles.avatarIniciales}>{iniciales(p.nombreUsuario)}</Text>
          </View>
        )}
        <View>
          <Text style={styles.autorNombre}>{p.nombreUsuario}</Text>
          <Text style={styles.fecha}>{formatearFecha(p.fechaPublicacion)}</Text>
        </View>
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
          <Button titulo="Denunciar publicación" variant="secundario" onPress={() => setReportando(true)} />
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
          <Text style={styles.modalTitulo}>Denunciar publicación</Text>
          <Mensaje texto={error} />
          <View style={styles.motivos}>
            {MOTIVOS.map((m) => (
              <Pressable key={m} onPress={() => setMotivo(m)} style={[styles.motivo, motivo === m && styles.motivoActivo]}>
                <Text style={[styles.motivoTexto, motivo === m && styles.motivoTextoActivo]}>{m}</Text>
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
  lugar: { color: colors.primario, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  autor: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.superficieClara },
  avatarVacio: { alignItems: 'center', justifyContent: 'center' },
  avatarIniciales: { color: colors.primario, fontWeight: '800' },
  autorNombre: { color: colors.texto, fontWeight: '700', fontSize: 15 },
  fecha: { color: colors.textoSecundario, fontSize: 12 },
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