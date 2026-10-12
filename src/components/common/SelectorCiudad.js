import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { mapasApi } from '../../api/mapasApi';
import { t } from '../../i18n';
import Icono from './Icono';

const ESPERA_MS = 300; // debounce del buscador
const LIMITE = 500;    // máximo que acepta el servidor; para ir más allá se usa el buscador

// El buscador solo admite texto: letras (con acentos), espacios, apóstrofos y guiones
const soloTexto = (texto) => texto.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'’-]/g, '');

/**
 * Desplegable de ciudades del país elegido, con el mismo estilo que SelectorPais.
 * El backend une las ciudades ya registradas con el catálogo mundial, así que el
 * listado tiene todas las ciudades del país aunque nadie haya publicado todavía ahí
 * (las que ya tienen publicaciones aparecen primero).
 * El filtrado se hace en el servidor porque hay países con miles de ciudades.
 *
 * Con `permitirTodas` (filtro del inicio) la primera opción es "Todas las ciudades" y no se
 * ofrece agregar ciudades nuevas.
 *
 * onSeleccion({ ciudadId, nombre, registrada, tienePublicaciones }) — o null al elegir "Todas las ciudades".
 * Las ciudades del catálogo que nadie registró todavía llegan con ciudadId 0.
 */
export default function SelectorCiudad({
  paisId,
  paisNombre,
  valor,
  onSeleccion,
  etiqueta = 'Ciudad',
  placeholder = 'Elegí una ciudad',
  permitirTodas = false,
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [consulta, setConsulta] = useState(''); // texto ya "debounceado"
  // La respuesta se guarda junto al país y la búsqueda que la originó: así se
  // sabe si lo que está en pantalla corresponde a lo que se está pidiendo.
  const [datos, setDatos] = useState({ paisId: null, q: '', lista: [], error: '' });

  const alDia = !!paisId && datos.paisId === paisId && datos.q === consulta;
  const ciudades = alDia ? datos.lista : [];
  const cargando = !!paisId && !alDia;
  const error = alDia ? datos.error : '';

  // Debounce del texto escrito
  useEffect(() => {
    const id = setTimeout(() => setConsulta(texto.trim()), ESPERA_MS);
    return () => clearTimeout(id);
  }, [texto]);

  useEffect(() => {
    if (!paisId) return;
    let activo = true;
    mapasApi.ciudades(paisId, false, { q: consulta, limite: LIMITE })
      .then((lista) => activo && setDatos({ paisId, q: consulta, lista, error: '' }))
      .catch(() => activo && setDatos({
        paisId, q: consulta, lista: [],
        error: permitirTodas
          ? 'No se pudieron cargar las ciudades.'
          : 'No se pudieron cargar las ciudades. Igual podés escribir la tuya.',
      }));
    return () => { activo = false; };
  }, [paisId, consulta, permitirTodas]);

  const buscado = texto.trim();
  const yaExiste = ciudades.some((c) => c.nombre.toLowerCase() === buscado.toLowerCase());
  const hayMas = ciudades.length >= LIMITE && !buscado;

  const elegir = (ciudad) => {
    onSeleccion?.(ciudad);
    setAbierto(false);
    setTexto('');
  };

  // Cada apertura arranca con el buscador limpio (si no, queda el filtro anterior)
  const abrir = () => { if (paisId) { setTexto(''); setAbierto(true); } };
  const cerrar = () => { setAbierto(false); setTexto(''); };

  return (
    <View style={styles.contenedor}>
      {etiqueta ? <Text style={styles.etiqueta}>{t(etiqueta)}</Text> : null}
      <Pressable style={[styles.campo, !paisId && styles.campoInactivo]} onPress={abrir} disabled={!paisId}>
        <Text style={[styles.valor, !valor && styles.placeholder]} numberOfLines={1}>
          {valor?.nombre || t(paisId ? placeholder : 'Elegí primero el país')}
        </Text>
        <Text style={styles.flecha}>▾</Text>
      </Pressable>

      <Modal visible={abierto} animationType="slide" onRequestClose={cerrar}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.cabecera}>
            <TextInput
              style={styles.buscador}
              placeholder={paisNombre ? t('Buscar ciudad en {pais}…', { pais: paisNombre }) : t('Buscar ciudad…')}
              placeholderTextColor={colors.textoSecundario}
              value={texto}
              onChangeText={(v) => setTexto(soloTexto(v))}
              autoFocus
            />
            <Pressable onPress={cerrar}>
              <Text style={styles.cerrar}>{t('Cerrar')}</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{t(error)}</Text> : null}
          {cargando ? (
            <View style={styles.estado}>
              <ActivityIndicator size="small" color={colors.primario} />
              <Text style={styles.estadoTexto}>{t('Buscando ciudades…')}</Text>
            </View>
          ) : null}

          <FlatList
            data={ciudades}
            keyExtractor={(c) => `${c.ciudadId}-${c.nombre}`}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              // Filtro del inicio: opción para quitar el filtro de ciudad.
              // Wizard: el catálogo no cubre todas las localidades, se puede agregar a mano.
              permitirTodas ? (
                buscado ? null : (
                  <Pressable style={styles.item} onPress={() => elegir(null)}>
                    <Text style={[styles.itemTexto, !valor && styles.itemActivo]}>{t('Todas las ciudades')}</Text>
                  </Pressable>
                )
              ) : buscado && !yaExiste && !cargando ? (
                <Pressable style={[styles.item, styles.itemNueva]} onPress={() => elegir({ nombre: buscado })}>
                  <View style={styles.agregar}>
                    <Icono nombre="mas" size={18} color={colors.primario} />
                    <Text style={styles.itemNuevaTexto} numberOfLines={1}>{t('Agregar “{ciudad}”', { ciudad: buscado })}</Text>
                  </View>
                </Pressable>
              ) : null
            }
            ListFooterComponent={hayMas ? <Text style={styles.pista}>{t('Escribí para buscar entre más ciudades.')}</Text> : null}
            ListEmptyComponent={
              cargando ? null : (
                <Text style={styles.vacio}>
                  {permitirTodas
                    ? t(buscado ? 'Ninguna ciudad coincide.' : 'No hay ciudades disponibles para {pais}.', { pais: paisNombre || t('este país') })
                    : buscado
                      ? t('Ninguna ciudad coincide. Podés agregarla con el botón de arriba.')
                      : t('No hay ciudades disponibles para {pais}. Escribí la tuya para agregarla.', { pais: paisNombre || t('este país') })}
                </Text>
              )
            }
            renderItem={({ item }) => (
              <Pressable style={styles.item} onPress={() => elegir(item)}>
                <Text style={[styles.itemTexto, valor?.nombre === item.nombre && styles.itemActivo]}>{item.nombre}</Text>
                {item.tienePublicaciones ? <Text style={styles.insignia}>{t('con publicaciones')}</Text> : null}
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
  campoInactivo: { opacity: 0.55 },
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
  error: { color: colors.advertencia, fontSize: 13, paddingHorizontal: 20, paddingBottom: 8 },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 10 },
  estadoTexto: { color: colors.textoSecundario, fontSize: 12 },
  item: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.borde,
  },
  itemNueva: { backgroundColor: colors.superficie },
  agregar: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  itemNuevaTexto: { color: colors.primario, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  itemTexto: { color: colors.texto, fontSize: 16, flex: 1 },
  itemActivo: { color: colors.primario, fontWeight: '700' },
  insignia: { color: colors.primario, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  pista: { color: colors.textoSecundario, textAlign: 'center', fontSize: 12, padding: 16 },
  vacio: { color: colors.textoSecundario, textAlign: 'center', marginTop: 40, paddingHorizontal: 30, lineHeight: 20 },
});
