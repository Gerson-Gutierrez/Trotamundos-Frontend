import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../constants/colors';
import { superAdminApi } from '../../api/superAdminApi';
import { formatearFecha, mensajeError } from '../../utils/formatters';
import { avisar, confirmar } from '../../utils/dialogos';

export default function CorreosBloqueadosScreen() {
  const [correos, setCorreos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    superAdminApi.correosBloqueados().then(setCorreos).catch(() => {}).finally(() => setCargando(false));
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const desbloquear = async (c) => {
    if (!(await confirmar('Desbloquear correo', `${c.email} podrá volver a registrarse o ser invitado.`, { textoOk: 'Desbloquear' }))) return;
    try {
      await superAdminApi.desbloquearCorreo(c.email);
      cargar();
    } catch (e) {
      avisar('Error', mensajeError(e));
    }
  };

  if (cargando) return <LoadingSpinner />;

  return (
    <FlatList
      data={correos}
      keyExtractor={(c) => c.email}
      contentContainerStyle={styles.lista}
      style={{ backgroundColor: colors.fondo }}
      ListEmptyComponent={<Text style={styles.vacio}>No hay correos bloqueados.</Text>}
      renderItem={({ item: c }) => (
        <View style={styles.item}>
          <Text style={styles.email}>🚫 {c.email}</Text>
          {c.motivo ? <Text style={styles.dato}>Motivo: {c.motivo}</Text> : null}
          <Text style={styles.dato}>Bloqueado el {formatearFecha(c.fechaBloqueo)}</Text>
          <Button titulo="Desbloquear" variant="secundario" onPress={() => desbloquear(c)} style={styles.boton} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 14, width: '100%', maxWidth: 720, alignSelf: 'center' },
  vacio: { color: colors.textoSecundario, textAlign: 'center', marginTop: 24 },
  item: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 12, padding: 12, marginBottom: 10 },
  email: { color: colors.texto, fontWeight: '700', fontSize: 15 },
  dato: { color: colors.textoSecundario, fontSize: 12, marginTop: 2 },
  boton: { marginTop: 10, minHeight: 40, paddingVertical: 8 },
});
