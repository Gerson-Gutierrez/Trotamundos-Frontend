import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import { elegirImagenes } from '../../components/common/SelectorImagen';
import WizardPie from '../../components/wizard/WizardPie';
import { colors } from '../../constants/colors';
import { useWizard } from '../../hooks/useWizard';
import { t } from '../../i18n';
import Icono from '../../components/common/Icono';

const CATEGORIAS = ['Alojamiento', 'Comida', 'Lugar'];
const MAXIMO = 10;

// Paso 5: fotos del lugar, hospedaje, comidas… Se suben recién al confirmar.
export default function WizardStep5FotosScreen({ navigation }) {
  const { borrador, actualizar } = useWizard();
  const [imagenes, setImagenes] = useState(borrador.imagenes || []); // [{ asset, tipoCategoria }]
  const [error, setError] = useState('');

  const agregar = async () => {
    const assets = await elegirImagenes({ multiple: true, limite: MAXIMO - imagenes.length });
    if (!assets.length) return;
    setImagenes((prev) => [...prev, ...assets.map((asset) => ({ asset, tipoCategoria: 'Lugar' }))].slice(0, MAXIMO));
    setError('');
  };

  const quitar = (i) => setImagenes((prev) => prev.filter((_, idx) => idx !== i));
  const cambiarCategoria = (i, cat) => setImagenes((prev) => prev.map((img, idx) => (idx === i ? { ...img, tipoCategoria: cat } : img)));

  const siguiente = () => {
    if (imagenes.length === 0) {
      return setError(t('Subí al menos una foto para continuar.'));
    }

    setError('');
    actualizar({ imagenes });
    navigation.navigate('WizardConfirmar');
  };

  return (
    <Pantalla>
      <Titulo subtitulo={t('Subí las fotos que sacaste del lugar, el hospedaje, las comidas… (hasta {max})', { max: MAXIMO })}>Imágenes</Titulo>

      <Mensaje texto={error} />

      <Button titulo="Elegir fotos" icono="camara" variant="secundario" onPress={agregar} deshabilitado={imagenes.length >= MAXIMO} />

      <View style={styles.grilla}>
        {imagenes.map((img, i) => (
          <View key={`${img.asset.uri}-${i}`} style={styles.celda}>
            <Image source={{ uri: img.asset.uri }} style={styles.imagen} />
            <Pressable onPress={() => quitar(i)} style={styles.quitar} hitSlop={8} accessibilityLabel={t('Quitar')}>
              <Icono nombre="cerrar" size={18} color={colors.blanco} />
            </Pressable>
            <View style={styles.categorias}>
              {CATEGORIAS.map((c) => (
                <Pressable key={c} onPress={() => cambiarCategoria(i, c)}
                  style={[styles.categoria, img.tipoCategoria === c && styles.categoriaActiva]}>
                  <Text style={[styles.categoriaTexto, img.tipoCategoria === c && styles.categoriaTextoActiva]}>{t(c)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>

      {imagenes.length === 0 && <Text style={styles.vacio}>{t('Todavía no elegiste ninguna foto.')}</Text>}

      <WizardPie paso={5} onSiguiente={siguiente} textoSiguiente="Siguiente" />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  grilla: { marginTop: 16, gap: 14 },
  celda: { backgroundColor: colors.superficie, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.borde },
  imagen: { width: '100%', height: 200 },
  quitar: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  categorias: { flexDirection: 'row', gap: 6, padding: 10 },
  categoria: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: colors.borde },
  categoriaActiva: { backgroundColor: colors.primario, borderColor: colors.primario },
  categoriaTexto: { color: colors.textoSecundario, fontSize: 12 },
  categoriaTextoActiva: { color: colors.fondo, fontWeight: '700' },
  vacio: { color: colors.textoSecundario, textAlign: 'center', marginTop: 24 },
});