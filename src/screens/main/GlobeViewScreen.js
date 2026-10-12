import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GlobeWebView from '../../components/globe/GlobeWebView';
import Button from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { mapasApi } from '../../api/mapasApi';
import { usePaises } from '../../hooks/usePaises';
import { t } from '../../i18n';
import { nombrePais } from '../../utils/formatters';

/**
 * Globo a pantalla completa. Un toque muestra el país; doble toque (o el botón) lo confirma.
 * Sirve para dos cosas distintas y los textos se adaptan:
 *  - destino 'Inicio': filtrar el feed por país.
 *  - destino 'WizardCiudad': elegir el país de la publicación que se está creando.
 */
export default function GlobeViewScreen({ navigation, route }) {
  const { porIso } = usePaises();
  const [pais, setPais] = useState(null);
  const [aviso, setAviso] = useState(t('Tocá un país en el globo'));
  const destino = route.params?.destino || 'Inicio';
  const eligiendoParaPublicar = destino === 'WizardCiudad';

  const resolver = useCallback(async ({ iso, nombre }) => {
    const encontrado = porIso[iso] || (await mapasApi.paisPorIso(iso).catch(() => null));
    if (!encontrado) {
      setPais(null);
      setAviso(t('{pais} todavía no está disponible', { pais: nombre }));
      return null;
    }
    setPais(encontrado);
    setAviso('');
    return encontrado;
  }, [porIso]);

  const confirmar = useCallback((elegido) => {
    if (!elegido) return;
    if (eligiendoParaPublicar) {
      navigation.navigate('Wizard', { screen: 'WizardCiudad', params: { pais: elegido }, merge: true });
    } else {
      navigation.navigate('MainTabs', { screen: 'Inicio', params: { pais: elegido }, merge: true });
    }
  }, [eligiendoParaPublicar, navigation]);

  const tituloBoton = !pais
    ? t('Elegí un país')
    : eligiendoParaPublicar
      ? t('Aceptar')
      : t('Ver publicaciones de {pais}', { pais: nombrePais(pais.codigoIso, pais.nombre) });

  return (
    <View style={styles.contenedor}>
      <GlobeWebView
        onPaisTocado={resolver}
        onPaisConfirmado={async (p) => confirmar(await resolver(p))}
        onSinPais={() => { setPais(null); setAviso(t('Tocá un país en el globo')); }}
        onError={setAviso}
      />
      <View style={styles.panel}>
        <Text style={styles.texto}>{pais ? `${nombrePais(pais.codigoIso, pais.nombre)} (${pais.codigoIso})` : aviso}</Text>
        <Button titulo={tituloBoton} onPress={() => confirmar(pais)} deshabilitado={!pais} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.fondo },
  panel: { padding: 16, backgroundColor: colors.superficie, borderTopWidth: 1, borderTopColor: colors.borde, gap: 10 },
  texto: { color: colors.texto, fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
