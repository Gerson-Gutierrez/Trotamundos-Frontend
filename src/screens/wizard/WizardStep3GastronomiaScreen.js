import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import MapaPicker from '../../components/mapa/MapaPicker';
import BuscadorDireccion from '../../components/wizard/BuscadorDireccion';
import WizardPie from '../../components/wizard/WizardPie';
import { colors } from '../../constants/colors';
import { useWizard } from '../../hooks/useWizard';
import { usePrecargaLugares } from '../../hooks/usePrecargaLugares';
import { t } from '../../i18n';
import Icono, { TextoIcono } from '../../components/common/Icono';

const restauranteVacio = { nombre: '', direccion: '', latitud: null, longitud: null, placeIdApi: null };

// Paso 3: comidas de la zona + restaurantes (opcionales, con ubicación opcional).
export default function WizardStep3GastronomiaScreen({ navigation }) {
  const { borrador, actualizar } = useWizard();
  const [reseña, setReseña] = useState(borrador.gastronomia?.reseñaGeneral || '');
  const [restaurantes, setRestaurantes] = useState(borrador.gastronomia?.restaurantes || []);
  const [agregando, setAgregando] = useState(false);
  const [nuevo, setNuevo] = useState(restauranteVacio);
  const [error, setError] = useState('');

  // Deja listo el listado de la ciudad mientras el usuario lee la pantalla
  usePrecargaLugares('restaurante', borrador.ciudad?.nombre, borrador.pais?.codigoIso);

  const agregarRestaurante = () => {
    if (!nuevo.nombre.trim()) return setError(t('Ingresá el nombre del restaurante.'));
    setError('');
    setRestaurantes((r) => [...r, { ...nuevo, nombre: nuevo.nombre.trim() }]);
    setNuevo(restauranteVacio);
    setAgregando(false);
  };

  const quitar = (i) => setRestaurantes((r) => r.filter((_, idx) => idx !== i));

  // Al elegir un lugar del buscador: guarda coordenadas y, si el lugar tiene
  // nombre propio en el mapa (restaurante, café, bar), completa el nombre.
  const tomarLugar = (lugar) => {
    setNuevo((n) => ({
      ...n,
      direccion: lugar.direccion,
      latitud: lugar.latitud,
      longitud: lugar.longitud,
      placeIdApi: lugar.placeId,
      // Solo autocompleta si el resultado es un local gastronómico
      nombre: lugar.categoria === 'restaurante' ? lugar.nombre : n.nombre,
    }));
    setError('');
  };

  const handleCambioDireccion = (texto) => {
    setNuevo((n) => ({
      ...n,
      direccion: texto,
      ...(texto.trim() === '' ? { nombre: '', placeIdApi: null } : {}),
    }));
  };

  const guardar = () => {
    if (!reseña.trim()) {
      return setError(t('Contanos sobre las comidas típicas de la zona o qué recomendás comer.'));
    }

    setError('');
    actualizar({
      gastronomia: {
        reseñaGeneral: reseña.trim(),
        restaurantes,
      },
    });
    navigation.navigate('WizardRecomendaciones');
  };

  return (
    <Pantalla>
      <Titulo subtitulo="Contá sobre las comidas típicas y, si querés, agregá los restaurantes que visitaste.">
        Restaurantes y comidas
      </Titulo>

      <Mensaje texto={error} />

      <Input
        etiqueta="Comidas de la zona"
        value={reseña}
        onChangeText={(v) => {
          setReseña(v);
          if (error) setError('');
        }}
        multiline
        placeholder="¿Qué probaste? ¿Qué recomendás comer?"
      />

      {restaurantes.map((r, i) => (
        <View key={i} style={styles.restaurante}>
          <View style={{ flex: 1 }}>
            <TextoIcono icono="restaurante" color={colors.primario} style={styles.restauranteNombre}>{r.nombre}</TextoIcono>
            {r.direccion ? <Text style={styles.restauranteDireccion}>{r.direccion}</Text> : null}
            {r.latitud != null && (
              <TextoIcono icono="ubicacion" size={13} style={styles.restauranteDireccion} contenedorStyle={styles.ubicado}>
                {t('ubicado en el mapa')}
              </TextoIcono>
            )}
          </View>
          <Pressable onPress={() => quitar(i)} hitSlop={8} accessibilityLabel={t('Quitar')}>
            <Icono nombre="cerrar" size={20} color={colors.peligro} />
          </Pressable>
        </View>
      ))}

      {!agregando ? (
        <Button
          titulo="Agregar restaurante"
          icono="mas"
          variant="secundario"
          onPress={() => setAgregando(true)}
          style={styles.espacio}
        />
      ) : (
        <View style={styles.formulario}>
          <Text style={styles.formularioTitulo}>{t('Nuevo restaurante')}</Text>
          <BuscadorDireccion
            etiqueta="Buscar restaurante o dirección (opcional)"
            placeholder="Ej. La Parrilla de Don José, Las Heras 500…"
            valor={nuevo.direccion}
            onCambioTexto={handleCambioDireccion}
            codigoPais={borrador.pais?.codigoIso}
            ciudad={borrador.ciudad?.nombre}
            categoria="restaurante"
            onUbicacion={tomarLugar}
          />
          <Input
            etiqueta="Nombre"
            value={nuevo.nombre}
            onChangeText={(v) => setNuevo((n) => ({ ...n, nombre: v }))}
            placeholder="Ej. La Parrilla de Don José"
          />
          {nuevo.latitud != null && (
            <View style={styles.mapa}>
              <MapaPicker
                latitud={nuevo.latitud}
                longitud={nuevo.longitud}
                altura={180}
                titulo={nuevo.nombre}
                onCambio={({ latitud, longitud }) => setNuevo((n) => ({ ...n, latitud, longitud }))}
              />
            </View>
          )}
          <View style={styles.acciones}>
            <Button
              titulo="Cancelar"
              variant="texto"
              onPress={() => {
                setAgregando(false);
                setNuevo(restauranteVacio);
              }}
              style={{ flex: 1 }}
            />
            <Button titulo="Agregar" onPress={agregarRestaurante} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      <WizardPie
        paso={3}
        onSiguiente={guardar}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  espacio: { marginBottom: 10 },
  restaurante: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  restauranteNombre: { color: colors.texto, fontWeight: '700' },
  restauranteDireccion: { color: colors.textoSecundario, fontSize: 12, marginTop: 2 },
  ubicado: { marginTop: 2 },
  formulario: {
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.primario,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  formularioTitulo: { color: colors.primario, fontWeight: '700', marginBottom: 10 },
  mapa: { marginBottom: 12 },
  acciones: { flexDirection: 'row', gap: 10 },
});