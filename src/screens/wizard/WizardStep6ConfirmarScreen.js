import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Mensaje from '../../components/common/Mensaje';
import Button from '../../components/common/Button';
import WizardPie from '../../components/wizard/WizardPie';
import { colors } from '../../constants/colors';
import { archivosApi } from '../../api/archivosApi';
import { publicacionesApi } from '../../api/publicacionesApi';
import { useWizard } from '../../hooks/useWizard';
import { mensajeError, nombrePais } from '../../utils/formatters';
import { t } from '../../i18n';
import Icono, { TextoIcono } from '../../components/common/Icono';

// Paso 6: resumen + publicación. Primero sube las imágenes, después crea la publicación.
export default function WizardStep6ConfirmarScreen({ navigation }) {
  const { borrador, construirDto, reiniciar } = useWizard();
  const [error, setError] = useState('');
  const [estado, setEstado] = useState(''); // texto de progreso
  const [cargando, setCargando] = useState(false);

  const { pais, ciudad, alojamiento, gastronomia, recomendacion, imagenes } = borrador;
  const tieneContenido = alojamiento || gastronomia || recomendacion || imagenes.length > 0;

  const publicar = async () => {
    if (!tieneContenido) return setError(t('La publicación necesita al menos una sección o una foto.'));
    setError('');
    setCargando(true);
    try {
      let urls = [];
      if (imagenes.length) {
        setEstado(t('Subiendo {n} imagen(es)…', { n: imagenes.length }));
        const { urls: subidas } = await archivosApi.subirImagenesPublicacion(imagenes.map((i) => i.asset));
        urls = subidas.map((url, i) => ({ url, tipoCategoria: imagenes[i]?.tipoCategoria }));
      }
      setEstado(t('Creando publicación…'));
      const creada = await publicacionesApi.crear(construirDto(urls));
      reiniciar();
      // Reemplaza el wizard por el detalle de la publicación recién creada
      navigation.getParent()?.replace('DetallePublicacion', { id: creada.publicacionId });
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
      setEstado('');
    }
  };

  return (
    <Pantalla>
      <Titulo subtitulo="Revisá que esté todo bien antes de publicar.">Confirmar publicación</Titulo>

      <Mensaje texto={error} />
      {estado ? <Mensaje tipo="info" texto={estado} /> : null}

      <Bloque titulo="Ubicación" icono="ubicacion" onEditar={() => navigation.navigate('WizardCiudad')}>
        <Text style={styles.texto}>{ciudad?.nombre}, {nombrePais(pais?.codigoIso, pais?.nombre)}</Text>
      </Bloque>

      <Bloque titulo="Alojamiento" icono="alojamiento" onEditar={() => navigation.navigate('WizardAlojamiento')} vacio={!alojamiento}>
        {alojamiento && (
          <>
            <Text style={styles.texto}>{alojamiento.nombreHostelHotel}</Text>
            <Text style={styles.secundario}>{alojamiento.direccionTextual}</Text>
            {alojamiento.experiencia ? <Text style={styles.parrafo} numberOfLines={3}>{alojamiento.experiencia}</Text> : null}
          </>
        )}
      </Bloque>

      <Bloque titulo="Restaurantes y comidas" icono="restaurante" onEditar={() => navigation.navigate('WizardGastronomia')} vacio={!gastronomia}>
        {gastronomia?.reseñaGeneral ? <Text style={styles.parrafo} numberOfLines={3}>{gastronomia.reseñaGeneral}</Text> : null}
        {gastronomia?.restaurantes?.map((r, i) => <Text key={i} style={styles.texto}>• {r.nombre}</Text>)}
      </Bloque>

      <Bloque titulo="Recomendaciones" icono="recomendaciones" onEditar={() => navigation.navigate('WizardRecomendaciones')} vacio={!recomendacion}>
        {recomendacion?.contenido ? <Text style={styles.parrafo} numberOfLines={4}>{recomendacion.contenido}</Text> : null}
        {recomendacion?.agencias?.map((a, i) => <TextoIcono key={i} icono="agencia" color={colors.primario} style={styles.texto}>{a.nombre}</TextoIcono>)}
      </Bloque>

      <Bloque titulo={`${t('Imágenes')} (${imagenes.length})`} icono="camara" onEditar={() => navigation.navigate('WizardFotos')} vacio={!imagenes.length}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {imagenes.map((img, i) => <Image key={i} source={{ uri: img.asset.uri }} style={styles.miniatura} />)}
        </ScrollView>
      </Bloque>

      <WizardPie paso={6} onSiguiente={publicar} textoSiguiente="Publicar" iconoSiguiente="publicar" cargando={cargando} />
    </Pantalla>
  );
}

function Bloque({ titulo, icono, children, onEditar, vacio }) {
  return (
    <View style={styles.bloque}>
      <View style={styles.bloqueCabecera}>
        <View style={styles.bloqueTituloFila}>
          {icono ? <Icono nombre={icono} size={18} color={colors.primario} /> : null}
          <Text style={styles.bloqueTitulo}>{t(titulo)}</Text>
        </View>
        <Button titulo={vacio ? 'Agregar' : 'Editar'} variant="texto" onPress={onEditar} style={styles.editar} />
      </View>
      {vacio ? <Text style={styles.secundario}>{t('Sin contenido')}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 14, padding: 14, marginBottom: 12 },
  bloqueCabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  bloqueTituloFila: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  bloqueTitulo: { color: colors.texto, fontWeight: '800', fontSize: 16, flexShrink: 1 },
  editar: { minHeight: 0, paddingVertical: 0, paddingHorizontal: 0 },
  texto: { color: colors.texto, fontSize: 15 },
  secundario: { color: colors.textoSecundario, fontSize: 13 },
  parrafo: { color: colors.texto, fontSize: 14, lineHeight: 20, marginTop: 4 },
  miniatura: { width: 80, height: 80, borderRadius: 10, marginRight: 8, backgroundColor: colors.superficieClara },
});
