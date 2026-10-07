/*import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { usePaises } from '../../hooks/usePaises';

// Campo que abre un buscador de países (lista del backend). onSeleccion(pais)
export default function SelectorPais({ etiqueta = 'País', valor, onSeleccion, placeholder = 'Elegí un país' }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const { buscar, cargando } = usePaises();

  const resultados = buscar(texto);

  const elegir = (pais) => {
    onSeleccion?.(pais);
    setAbierto(false);
    setTexto('');
  };

  return (
    <View style={styles.contenedor}>
      {etiqueta ? <Text style={styles.etiqueta}>{etiqueta}</Text> : null}
      <Pressable style={styles.campo} onPress={() => setAbierto(true)}>
        <Text style={[styles.valor, !valor && styles.placeholder]} numberOfLines={1}>
          {valor ? `${valor.nombre}${valor.codigoIso ? ` (${valor.codigoIso})` : ''}` : placeholder}
        </Text>
        <Text style={styles.flecha}>▾</Text>
      </Pressable>

      <Modal visible={abierto} animationType="slide" onRequestClose={() => setAbierto(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.cabecera}>
            <TextInput
              style={styles.buscador}
              placeholder="Buscar país…"
              placeholderTextColor={colors.textoSecundario}
              value={texto}
              onChangeText={setTexto}
              autoFocus
            />
            <Pressable onPress={() => setAbierto(false)}>
              <Text style={styles.cerrar}>Cerrar</Text>
            </Pressable>
          </View>
          <FlatList
            data={resultados}
            keyExtractor={(p) => String(p.paisId)}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.vacio}>{cargando ? 'Cargando países…' : 'Sin resultados'}</Text>
            }
            renderItem={({ item }) => (
              <Pressable style={styles.item} onPress={() => elegir(item)}>
                <Text style={styles.itemTexto}>{item.nombre}</Text>
                <Text style={styles.itemIso}>{item.codigoIso}</Text>
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: 14 },
  etiqueta: { color: colors.textoSecundario, marginBottom: 6, fontSize: 13, fontWeight: '600' },
  campo: {
    backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
  },
  valor: { color: colors.texto, fontSize: 16, flex: 1 },
  placeholder: { color: colors.textoSecundario },
  flecha: { color: colors.textoSecundario, fontSize: 18 },
  modal: { flex: 1, backgroundColor: colors.fondo },
  cabecera: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  buscador: {
    flex: 1, backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, color: colors.texto, fontSize: 16,
  },
  cerrar: { color: colors.primario, fontWeight: '700' },
  item: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.borde,
  },
  itemTexto: { color: colors.texto, fontSize: 16, flex: 1 },
  itemIso: { color: colors.textoSecundario },
  vacio: { color: colors.textoSecundario, textAlign: 'center', marginTop: 40 },
});
*/



import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { usePaises } from '../../hooks/usePaises';

// Objeto de opción fija para detectar la ubicación actual
const OPCION_UBICACION = {
  paisId: 'ubicacion_actual',
  nombre: '📡 Usar mi ubicación actual',
  codigoIso: '',
  esUbicacionActual: true,
};

// Campo que abre un buscador de países (lista del backend). onSeleccion(pais)
export default function SelectorPais({
  etiqueta = 'País',
  valor,
  onSeleccion,
  placeholder = 'Elegí un país',
  cargandoUbicacion = false,
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const { buscar, cargando } = usePaises();

  const paisesFiltrados = buscar(texto);

  // Incluir la opción de "Ubicación actual" al inicio si no hay filtro o si coincide con el texto
  const mostrarOpcionUbicacion =
    !texto.trim() || 'usar mi ubicación actual'.includes(texto.toLowerCase().trim());

  const resultados = mostrarOpcionUbicacion
    ? [OPCION_UBICACION, ...paisesFiltrados]
    : paisesFiltrados;

  const elegir = (pais) => {
    onSeleccion?.(pais);
    setAbierto(false);
    setTexto('');
  };

  return (
    <View style={styles.contenedor}>
      {etiqueta ? <Text style={styles.etiqueta}>{etiqueta}</Text> : null}
      <Pressable style={styles.campo} onPress={() => setAbierto(true)}>
        <Text style={[styles.valor, !valor && styles.placeholder]} numberOfLines={1}>
          {valor ? `${valor.nombre}${valor.codigoIso ? ` (${valor.codigoIso})` : ''}` : placeholder}
        </Text>
        <Text style={styles.flecha}>▾</Text>
      </Pressable>

      <Modal visible={abierto} animationType="slide" onRequestClose={() => setAbierto(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.cabecera}>
            <TextInput
              style={styles.buscador}
              placeholder="Buscar país…"
              placeholderTextColor={colors.textoSecundario}
              value={texto}
              onChangeText={setTexto}
              autoFocus
            />
            <Pressable onPress={() => setAbierto(false)}>
              <Text style={styles.cerrar}>Cerrar</Text>
            </Pressable>
          </View>

          <FlatList
            data={resultados}
            keyExtractor={(p) => String(p.paisId)}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.vacio}>{cargando ? 'Cargando países…' : 'Sin resultados'}</Text>
            }
            renderItem={({ item }) => {
              const esUbicacion = item.esUbicacionActual;

              return (
                <Pressable
                  style={[styles.item, esUbicacion && styles.itemUbicacion]}
                  onPress={() => elegir(item)}
                  disabled={cargandoUbicacion}
                >
                  <Text style={[styles.itemTexto, esUbicacion && styles.itemTextoUbicacion]}>
                    {item.nombre}
                  </Text>
                  {esUbicacion && cargandoUbicacion ? (
                    <ActivityIndicator size="small" color={colors.primario} />
                  ) : (
                    <Text style={styles.itemIso}>{item.codigoIso}</Text>
                  )}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: 14 },
  etiqueta: { color: colors.textoSecundario, marginBottom: 6, fontSize: 13, fontWeight: '600' },
  campo: {
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  valor: { color: colors.texto, fontSize: 16, flex: 1 },
  placeholder: { color: colors.textoSecundario },
  flecha: { color: colors.textoSecundario, fontSize: 18 },
  modal: { flex: 1, backgroundColor: colors.fondo },
  cabecera: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  buscador: {
    flex: 1,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.texto,
    fontSize: 16,
  },
  cerrar: { color: colors.primario, fontWeight: '700' },
  item: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
    alignItems: 'center',
  },
  itemUbicacion: {
    backgroundColor: colors.superficie,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  itemTexto: { color: colors.texto, fontSize: 16, flex: 1 },
  itemTextoUbicacion: { color: colors.primario, fontWeight: '700' },
  itemIso: { color: colors.textoSecundario },
  vacio: { color: colors.textoSecundario, textAlign: 'center', marginTop: 40 },
});