import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Input from '../common/Input';
import { colors } from '../../constants/colors';
import { agenciasApi } from '../../api/agenciasApi';
import { sinProtocolo } from '../../utils/formatters';

const ESPERA_MS = 600;
const MINIMO_CARACTERES = 3;

// De dónde salió el resultado, para que el usuario sepa qué está eligiendo
const FUENTES = {
  web: { icono: '🔎', etiqueta: 'Web' },
  mapa: { icono: '📍', etiqueta: 'Local' },
  marca: { icono: '🏷️', etiqueta: 'Sitio oficial' },
};

/**
 * Buscador de agencias de turismo por nombre. El backend consulta la web y
 * devuelve el sitio oficial de cada agencia; al elegir una se guarda su URL
 * para mostrarla como enlace en la publicación.
 *
 * onSeleccion({ nombre, url })
 */
export default function BuscadorAgencia({ valor, onCambioTexto, onSeleccion, codigoPais, ciudad }) {
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState('');

  const abortRef = useRef(null);
  const yaElegidos = useRef([]);

  const buscar = useCallback(async (texto) => {
    abortRef.current?.abort();
    const control = new AbortController();
    abortRef.current = control;

    setBuscando(true);
    setAviso('');
    try {
      const lista = await agenciasApi.buscar(texto, { pais: codigoPais, ciudad, signal: control.signal });
      if (control.signal.aborted) return;
      setResultados(lista);
      if (!lista.length) {
        setAviso('No encontramos esa agencia en la web. Podés escribir su página más abajo.');
      }
    } catch (e) {
      if (e.code === 'ERR_CANCELED' || e.name === 'CanceledError' || e.name === 'AbortError') return;
      setAviso('No se pudo buscar en la web. Podés escribir el nombre y la página a mano.');
    } finally {
      if (!control.signal.aborted) setBuscando(false);
    }
  }, [codigoPais, ciudad]);

  useEffect(() => {
    const texto = (valor || '').trim();
    if (texto.length < MINIMO_CARACTERES || yaElegidos.current.includes(texto)) {
      setResultados([]);
      setBuscando(false);
      return;
    }
    const id = setTimeout(() => buscar(texto), ESPERA_MS);
    return () => clearTimeout(id);
  }, [valor, buscar]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const elegir = (agencia) => {
    yaElegidos.current = [agencia.nombre].filter(Boolean);
    abortRef.current?.abort();
    setResultados([]);
    setAviso('');
    setBuscando(false);
    onSeleccion?.(agencia);
  };

  return (
    <View>
      <Input
        etiqueta="Nombre de la agencia"
        value={valor}
        onChangeText={onCambioTexto}
        placeholder="Ej. Turismo Tastil, Despegar…"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={() => (valor || '').trim().length >= MINIMO_CARACTERES && buscar(valor.trim())}
        style={styles.sinMargen}
      />

      {buscando ? (
        <View style={styles.estado}>
          <ActivityIndicator size="small" color={colors.primario} />
          <Text style={styles.estadoTexto}>Buscando la agencia en la web…</Text>
        </View>
      ) : (
        <Text style={styles.ayuda}>Escribí el nombre y elegí la agencia: su página se completa sola.</Text>
      )}

      {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

      {resultados.map((a) => {
        const fuente = FUENTES[a.fuente] || FUENTES.web;
        return (
          <Pressable
            key={a.url}
            onPress={() => elegir(a)}
            style={({ pressed }) => [styles.resultado, pressed && styles.presionado]}
          >
            <Text style={styles.icono}>{fuente.icono}</Text>
            <View style={styles.textos}>
              <Text style={styles.nombre} numberOfLines={1}>{a.nombre}</Text>
              <Text style={styles.url} numberOfLines={1}>🌐 {sinProtocolo(a.url)}</Text>
              {a.descripcion ? <Text style={styles.descripcion} numberOfLines={2}>{a.descripcion}</Text> : null}
            </View>
            <Text style={styles.insignia}>{fuente.etiqueta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sinMargen: { marginBottom: 6 },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  estadoTexto: { color: colors.textoSecundario, fontSize: 12 },
  ayuda: { color: colors.textoSecundario, fontSize: 12, marginBottom: 10 },
  aviso: { color: colors.advertencia, fontSize: 13, marginBottom: 10 },
  resultado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.superficieClara,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  presionado: { opacity: 0.7 },
  icono: { fontSize: 18 },
  textos: { flex: 1 },
  nombre: { color: colors.texto, fontSize: 15, fontWeight: '700' },
  url: { color: colors.primario, fontSize: 12, marginTop: 2 },
  descripcion: { color: colors.textoSecundario, fontSize: 11, marginTop: 2 },
  insignia: { color: colors.textoSecundario, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
});
