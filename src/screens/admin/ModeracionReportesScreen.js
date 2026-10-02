import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../constants/colors';
import { reportesApi } from '../../api/reportesApi';
import { formatearFechaHora, textoAutoEliminacion } from '../../utils/formatters';

const ESTADOS = ['Pendiente', 'EnRevision', 'Resuelto', 'Desestimado'];
const COLOR_ESTADO = { Pendiente: colors.advertencia, EnRevision: '#60a5fa', Resuelto: colors.exito, Desestimado: colors.textoSecundario };

export default function ModeracionReportesScreen({ navigation }) {
  const [estado, setEstado] = useState('Pendiente');
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(useCallback(() => {
    let activo = true;
    setCargando(true);
    reportesApi.listar(estado)
      .then((d) => activo && setReportes(d))
      .catch(() => activo && setReportes([]))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, [estado]));

  return (
    <View style={styles.contenedor}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtros} contentContainerStyle={styles.filtrosContenido}>
        {ESTADOS.map((e) => (
          <Pressable key={e} onPress={() => setEstado(e)} style={[styles.chip, estado === e && styles.chipActivo]}>
            <Text style={[styles.chipTexto, estado === e && styles.chipTextoActivo]}>{e}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {cargando ? <LoadingSpinner /> : (
        <FlatList
          data={reportes}
          keyExtractor={(r) => String(r.reporteId)}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text style={styles.vacio}>{`No hay reportes en estado "${estado}".`}</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.item} onPress={() => navigation.navigate('DetalleReporteAdmin', { reporte: item })}>
              <View style={styles.itemCabecera}>
                <Text style={styles.motivo}>🚩 {item.motivo}</Text>
                <Text style={[styles.estado, { color: COLOR_ESTADO[item.estado] }]}>{item.estado}</Text>
              </View>
              <Text style={styles.texto}>Publicación #{item.publicacionId} · por {item.nombreUsuarioReportador}</Text>
              {item.detalle ? <Text style={styles.detalle} numberOfLines={2}>{item.detalle}</Text> : null}
              <Text style={styles.fecha}>{formatearFechaHora(item.fechaReporte)}</Text>
              {item.fechaResolucion ? <Text style={styles.fecha}>{textoAutoEliminacion(item.fechaResolucion)}</Text> : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.fondo },
  filtros: { flexGrow: 0 },
  filtrosContenido: { padding: 14, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde },
  chipActivo: { backgroundColor: colors.primario, borderColor: colors.primario },
  chipTexto: { color: colors.texto, fontSize: 13 },
  chipTextoActivo: { color: colors.fondo, fontWeight: '700' },
  lista: { padding: 14, paddingTop: 0 },
  item: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 12, padding: 14, marginBottom: 10 },
  itemCabecera: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  motivo: { color: colors.texto, fontWeight: '700', fontSize: 15 },
  estado: { fontWeight: '700', fontSize: 12 },
  texto: { color: colors.textoSecundario, fontSize: 13 },
  detalle: { color: colors.texto, marginTop: 6, fontSize: 13 },
  fecha: { color: colors.textoSecundario, fontSize: 11, marginTop: 6 },
  vacio: { color: colors.textoSecundario, textAlign: 'center', marginTop: 40 },
});
