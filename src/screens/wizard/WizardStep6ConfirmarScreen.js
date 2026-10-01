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
import { mensajeError } from '../../utils/formatters';

// Paso 6: resumen + publicación. Primero sube las imágenes, después crea la publicación.
export default function WizardStep6ConfirmarScreen({ navigation }) {
  const { borrador, construirDto, reiniciar } = useWizard();
  const [error, setError] = useState('');
  const [estado, setEstado] = useState(''); // texto de progreso
  const [cargando, setCargando] = useState(false);

  const { pais, ciudad, alojamiento, gastronomia, recomendacion, imagenes } = borrador;
  const tieneContenido = alojamiento || gastronomia || recomendacion || imagenes.length > 0;

  const publicar = async () => {
    if (!tieneContenido) return setError('La publicación necesita al menos una sección o una foto.');
    setError('');
    setCargando(true);
    try {
      let urls = [];
      if (imagenes.length) {
        setEstado(`Subiendo ${imagenes.length} imagen(es)…`);
        const { urls: subidas } = await archivosApi.subirImagenesPublicacion(imagenes.map((i) => i.asset));
        urls = subidas.map((url, i) => ({ url, tipoCategoria: imagenes[i]?.tipoCategoria }));
      }
      setEstado('Creando publicación…');
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

      <Bloque titulo="📍 Ubicación" onEditar={() => navigation.navigate('WizardCiudad')}>
        <Text style={styles.texto}>{ciudad?.nombre}, {pais?.nombre}</Text>
      </Bloque>

      <Bloque titulo="🏨 Alojamiento" onEditar={() => navigation.navigate('WizardAlojamiento')} vacio={!alojamiento}>
        {alojamiento && (
          <>
            <Text style={styles.texto}>{alojamiento.nombreHostelHotel}</Text>
            <Text style={styles.secundario}>{alojamiento.direccionTextual}</Text>
            {alojamiento.experiencia ? <Text style={styles.parrafo} numberOfLines={3}>{alojamiento.experiencia}</Text> : null}
          </>
        )}
      </Bloque>

      <Bloque titulo="🍽️ Restaurantes y comidas" onEditar={() => navigation.navigate('WizardGastronomia')} vacio={!gastronomia}>
        {gastronomia?.reseñaGeneral ? <Text style={styles.parrafo} numberOfLines={3}>{gastronomia.reseñaGeneral}</Text> : null}
        {gastronomia?.restaurantes?.map((r, i) => <Text key={i} style={styles.texto}>• {r.nombre}</Text>)}
      </Bloque>

      <Bloque titulo="🧭 Recomendaciones" onEditar={() => navigation.navigate('WizardRecomendaciones')} vacio={!recomendacion}>
        {recomendacion?.contenido ? <Text style={styles.parrafo} numberOfLines={4}>{recomendacion.contenido}</Text> : null}
        {recomendacion?.agencias?.map((a, i) => <Text key={i} style={styles.texto}>🎫 {a.nombre}</Text>)}
      </Bloque>

      <Bloque titulo={`📷 Imágenes (${imagenes.length})`} onEditar={() => navigation.navigate('WizardFotos')} vacio={!imagenes.length}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {imagenes.map((img, i) => <Image key={i} source={{ uri: img.asset.uri }} style={styles.miniatura} />)}
        </ScrollView>
      </Bloque>

      <WizardPie paso={6} onSiguiente={publicar} textoSiguiente="🚀 Publicar" cargando={cargando} />
    </Pantalla>
  );
}

function Bloque({ titulo, children, onEditar, vacio }) {
  return (
    <View style={styles.bloque}>
      <View style={styles.bloqueCabecera}>
        <Text style={styles.bloqueTitulo}>{titulo}</Text>
        <Button titulo={vacio ? 'Agregar' : 'Editar'} variant="texto" onPress={onEditar} style={styles.editar} />
      </View>
      {vacio ? <Text style={styles.secundario}>Sin contenido</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 14, padding: 14, marginBottom: 12 },
  bloqueCabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  bloqueTitulo: { color: colors.texto, fontWeight: '800', fontSize: 16 },
  editar: { minHeight: 0, paddingVertical: 0, paddingHorizontal: 0 },
  texto: { color: colors.texto, fontSize: 15 },
  secundario: { color: colors.textoSecundario, fontSize: 13 },
  parrafo: { color: colors.texto, fontSize: 14, lineHeight: 20, marginTop: 4 },
  miniatura: { width: 80, height: 80, borderRadius: 10, marginRight: 8, backgroundColor: colors.superficieClara },
});
