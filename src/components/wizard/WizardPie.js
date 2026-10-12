import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../common/Button';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';

const TOTAL_PASOS = 6;

// Barra de progreso + botones de navegación comunes a todos los pasos del wizard.
export default function WizardPie({ paso, onSiguiente, onOmitir, textoSiguiente = 'Siguiente', iconoSiguiente, cargando, deshabilitado }) {
  return (
    <View style={styles.pie}>
      <View style={styles.progreso}>
        {Array.from({ length: TOTAL_PASOS }).map((_, i) => (
          <View key={i} style={[styles.segmento, i < paso && styles.segmentoActivo]} />
        ))}
      </View>
      <Text style={styles.texto}>{t('Paso {paso} de {total}', { paso, total: TOTAL_PASOS })}</Text>
      <Button titulo={textoSiguiente} icono={iconoSiguiente} onPress={onSiguiente} cargando={cargando} deshabilitado={deshabilitado} />
      {onOmitir && <Button titulo="Omitir este paso" variant="texto" onPress={onOmitir} />}
    </View>
  );
}

const styles = StyleSheet.create({
  pie: { marginTop: 20 },
  progreso: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  segmento: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.borde },
  segmentoActivo: { backgroundColor: colors.primario },
  texto: { color: colors.textoSecundario, fontSize: 12, marginBottom: 14 },
});
