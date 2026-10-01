import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import { colors } from '../../constants/colors';
import { reportesApi } from '../../api/reportesApi';
import { formatearFechaHora, mensajeError } from '../../utils/formatters';
import { avisar, confirmar } from '../../utils/dialogos';

const ESTADOS = ['EnRevision', 'Resuelto', 'Desestimado'];

export default function DetalleReporteAdminScreen({ route, navigation }) {
  const { reporte } = route.params;
  const [estado, setEstado] = useState(reporte.estado === 'Pendiente' ? 'Resuelto' : reporte.estado);
  const [accion, setAccion] = useState(reporte.accionTomada || '');
  const [eliminarPublicacion, setEliminarPublicacion] = useState(false);
  const [bloquearAutor, setBloquearAutor] = useState(false);
  const [eliminarUsuario, setEliminarUsuario] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const resolver = async () => {
    if (eliminarPublicacion || bloquearAutor || eliminarUsuario) {
      const acciones = [
        eliminarPublicacion && 'eliminar la publicación',
        bloquearAutor && 'bloquear al autor',
        eliminarUsuario && 'eliminar al autor (se borrarán todas sus publicaciones, es irreversible)',
      ].filter(Boolean).join(' y ');
      if (!(await confirmar('Confirmar', `Vas a ${acciones}. ¿Continuar?`, { textoOk: 'Sí', destructivo: true }))) return;
    }
    setError('');
    setCargando(true);
    try {
      await reportesApi.resolver(reporte.reporteId, {
        estado,
        accionTomada: accion.trim() || (eliminarUsuario ? 'Usuario Eliminado' : eliminarPublicacion ? 'Publicación Eliminada' : bloquearAutor ? 'Usuario Bloqueado' : 'Sin Acción'),
        eliminarPublicacion,
        bloquearAutor,
        eliminarUsuario,
      });
      avisar('Listo', 'El reporte fue actualizado.');
      navigation.goBack();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo subtitulo={`Reporte #${reporte.reporteId} · ${formatearFechaHora(reporte.fechaReporte)}`}>🚩 {reporte.motivo}</Titulo>

      <View style={styles.info}>
        <Text style={styles.infoTexto}>Denunciado por: <Text style={styles.resaltado}>{reporte.nombreUsuarioReportador}</Text></Text>
        <Text style={styles.infoTexto}>Estado actual: <Text style={styles.resaltado}>{reporte.estado}</Text></Text>
        {reporte.detalle ? <Text style={styles.detalle}>{`"${reporte.detalle}"`}</Text> : null}
      </View>

      <Button titulo={`Ver publicación #${reporte.publicacionId}`} variant="secundario"
        onPress={() => navigation.navigate('DetallePublicacion', { id: reporte.publicacionId })} style={styles.espacio} />

      <Mensaje texto={error} />

      <Text style={styles.etiqueta}>Nuevo estado</Text>
      <View style={styles.estados}>
        {ESTADOS.map((e) => (
          <Pressable key={e} onPress={() => setEstado(e)} style={[styles.chip, estado === e && styles.chipActivo]}>
            <Text style={[styles.chipTexto, estado === e && styles.chipTextoActivo]}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <Input etiqueta="Acción tomada (opcional)" value={accion} onChangeText={setAccion} placeholder="Ej. Se pidió corregir la ubicación" />

      <Fila etiqueta="Eliminar la publicación" valor={eliminarPublicacion} onCambio={setEliminarPublicacion} />
      <Fila etiqueta="Bloquear al autor" valor={bloquearAutor} onCambio={setBloquearAutor} />
      <Fila etiqueta="Eliminar usuario" valor={eliminarUsuario} onCambio={setEliminarUsuario} />

      <Button titulo="Guardar resolución" onPress={resolver} cargando={cargando} style={{ marginTop: 16 }} />
    </Pantalla>
  );
}

function Fila({ etiqueta, valor, onCambio }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.filaTexto}>{etiqueta}</Text>
      <Switch value={valor} onValueChange={onCambio} trackColor={{ true: colors.primarioOscuro }} thumbColor={valor ? colors.primario : colors.textoSecundario} />
    </View>
  );
}

const styles = StyleSheet.create({
  info: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 12, padding: 14, marginBottom: 12 },
  infoTexto: { color: colors.textoSecundario, marginBottom: 4 },
  resaltado: { color: colors.texto, fontWeight: '700' },
  detalle: { color: colors.texto, fontStyle: 'italic', marginTop: 8 },
  espacio: { marginBottom: 16 },
  etiqueta: { color: colors.textoSecundario, marginBottom: 8, fontSize: 13, fontWeight: '600' },
  estados: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde },
  chipActivo: { backgroundColor: colors.primario, borderColor: colors.primario },
  chipTexto: { color: colors.texto, fontSize: 13 },
  chipTextoActivo: { color: colors.fondo, fontWeight: '700' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borde },
  filaTexto: { color: colors.texto, fontSize: 15 },
});
