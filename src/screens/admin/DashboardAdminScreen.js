import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Mensaje from '../../components/common/Mensaje';
import { colors } from '../../constants/colors';
import { reportesApi } from '../../api/reportesApi';
import { formatearFechaHora, mensajeError, textoAutoEliminacion } from '../../utils/formatters';

export default function DashboardAdminScreen({ navigation }) {
  const [pendientes, setPendientes] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let activo = true;
    Promise.all([reportesApi.listar('Pendiente'), reportesApi.notificaciones(false)])
      .then(([reportes, notifs]) => {
        if (!activo) return;
        setPendientes(reportes.length);
        setNotificaciones(notifs);
      })
      .catch((e) => activo && setError(mensajeError(e)));
    return () => { activo = false; };
  }, []));

  const marcarLeida = async (n) => {
    if (n.leida) return;
    await reportesApi.marcarLeida(n.notificacionId).catch(() => {});
    setNotificaciones((prev) => prev.map((x) => (x.notificacionId === n.notificacionId ? { ...x, leida: true, fechaLectura: new Date().toISOString() } : x)));
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <Pantalla>
      <Titulo subtitulo="Moderación de contenido y usuarios">Panel de administración</Titulo>
      <Mensaje texto={error} />

      <View style={styles.tarjetas}>
        <Tarjeta numero={pendientes} etiqueta="Reportes pendientes" onPress={() => navigation.navigate('ModeracionReportes')} />
        <Tarjeta numero={noLeidas} etiqueta="Alertas sin leer" />
      </View>

      <Pressable style={styles.enlace} onPress={() => navigation.navigate('ModeracionReportes')}>
        <Text style={styles.enlaceTexto}>🚩 Ver reportes</Text>
      </Pressable>
      <Pressable style={styles.enlace} onPress={() => navigation.navigate('UsuariosAdmin')}>
        <Text style={styles.enlaceTexto}>👥 Gestionar usuarios</Text>
      </Pressable>

      <Text style={styles.subtitulo}>Alertas</Text>
      {notificaciones.length === 0 && <Text style={styles.vacio}>No hay alertas.</Text>}
      {notificaciones.map((n) => (
        <Pressable key={n.notificacionId} onPress={() => marcarLeida(n)} style={[styles.notif, !n.leida && styles.notifNoLeida]}>
          <Text style={styles.notifTitulo}>{!n.leida ? '● ' : ''}{n.titulo}</Text>
          <Text style={styles.notifMensaje}>{n.mensaje}</Text>
          <Text style={styles.notifFecha}>{formatearFechaHora(n.fechaCreacion)}</Text>
          {n.fechaLectura ? <Text style={styles.notifFecha}>{textoAutoEliminacion(n.fechaLectura)}</Text> : null}
        </Pressable>
      ))}
    </Pantalla>
  );
}

function Tarjeta({ numero, etiqueta, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.tarjeta}>
      <Text style={styles.numero}>{numero}</Text>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjetas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  tarjeta: { flexGrow: 1, flexBasis: 140, backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 14, padding: 16, alignItems: 'center' },
  numero: { color: colors.primario, fontSize: 32, fontWeight: '900' },
  etiqueta: { color: colors.textoSecundario, fontSize: 12, marginTop: 4, textAlign: 'center' },
  enlace: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 12, padding: 14, marginBottom: 10 },
  enlaceTexto: { color: colors.texto, fontWeight: '600', fontSize: 15 },
  subtitulo: { color: colors.texto, fontSize: 17, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  vacio: { color: colors.textoSecundario },
  notif: { flexShrink: 0, backgroundColor: colors.superficie, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.borde },
  notifNoLeida: { borderColor: colors.advertencia },
  notifTitulo: { color: colors.texto, fontWeight: '700', flexShrink: 1 },
  notifMensaje: { color: colors.textoSecundario, marginTop: 4, fontSize: 13 },
  notifFecha: { color: colors.textoSecundario, marginTop: 6, fontSize: 11 },
});
