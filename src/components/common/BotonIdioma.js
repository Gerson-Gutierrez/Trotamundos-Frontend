import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Icono from './Icono';
import { colors } from '../../constants/colors';
import { IDIOMAS, t } from '../../i18n';
import { useIdioma } from '../../i18n/I18nProvider';

// Botón "traductor": abre la lista de idiomas y cambia el idioma de toda la app.
// La elección se guarda y se mantiene hasta que el usuario la vuelva a cambiar.
export default function BotonIdioma({ style }) {
  const { idioma, cambiarIdioma } = useIdioma();
  const [abierto, setAbierto] = useState(false);

  const elegir = async (codigo) => {
    setAbierto(false);
    if (codigo !== idioma) await cambiarIdioma(codigo);
  };

  return (
    <>
      <Pressable onPress={() => setAbierto(true)} hitSlop={8} accessibilityRole="button"
        accessibilityLabel={t('Cambiar idioma')} style={({ pressed }) => [styles.boton, pressed && styles.presionado, style]}>
        <Icono nombre="idioma" size={18} color={colors.primario} />
        <Text style={styles.codigo}>{idioma.toUpperCase()}</Text>
      </Pressable>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={styles.fondo} onPress={() => setAbierto(false)}>
          <View style={styles.caja} onStartShouldSetResponder={() => true}>
            <View style={styles.cabecera}>
              <Icono nombre="idioma" size={20} color={colors.primario} />
              <Text style={styles.titulo}>{t('Idioma')}</Text>
            </View>
            <FlatList
              data={IDIOMAS}
              keyExtractor={(i) => i.codigo}
              renderItem={({ item }) => {
                const activo = item.codigo === idioma;
                return (
                  <Pressable onPress={() => elegir(item.codigo)} style={({ pressed }) => [styles.item, pressed && styles.presionado]}>
                    <Text style={[styles.itemTexto, activo && styles.itemActivo]}>{item.nombre}</Text>
                    {activo ? <Icono nombre="check" size={20} color={colors.primario} /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18,
    backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde,
  },
  presionado: { opacity: 0.7 },
  codigo: { color: colors.texto, fontSize: 12, fontWeight: '800' },
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  caja: { width: '100%', maxWidth: 340, backgroundColor: colors.superficie, borderRadius: 16, borderWidth: 1, borderColor: colors.borde, paddingVertical: 8 },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borde },
  titulo: { color: colors.texto, fontSize: 17, fontWeight: '800' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  itemTexto: { color: colors.texto, fontSize: 16 },
  itemActivo: { color: colors.primario, fontWeight: '800' },
});
