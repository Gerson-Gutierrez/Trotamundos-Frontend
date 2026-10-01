import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Input from '../../components/common/Input';
import Mensaje from '../../components/common/Mensaje';
import MapaPicker from '../../components/mapa/MapaPicker';
import BuscadorDireccion from '../../components/wizard/BuscadorDireccion';
import WizardPie from '../../components/wizard/WizardPie';
import { colors } from '../../constants/colors';
import { useWizard } from '../../hooks/useWizard';
import { usePrecargaLugares } from '../../hooks/usePrecargaLugares';

// Paso 2: alojamiento (hostel/hotel/departamento) marcado en el mapa + experiencia.
export default function WizardStep2AlojamientoScreen({ navigation }) {
  const { borrador, actualizar } = useWizard();
  const [form, setForm] = useState(
    borrador.alojamiento || {
      nombreHostelHotel: '',
      direccionTextual: '',
      latitud: null,
      longitud: null,
      placeIdApi: null,
      experiencia: '',
    }
  );
  const [error, setError] = useState('');

  // Deja listo el listado de la ciudad mientras el usuario lee la pantalla
  usePrecargaLugares('alojamiento', borrador.ciudad?.nombre, borrador.pais?.codigoIso);

  const cambiar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));
  const tieneUbicacion = form.latitud != null && form.longitud != null;

  // Maneja el cambio manual en el buscador de dirección
  const handleCambioDireccion = (texto) => {
    setForm((f) => ({
      ...f,
      direccionTextual: texto,
      // Si el usuario borra por completo la dirección, limpiamos el nombre autocompletado y el lugar de la API
      ...(texto.trim() === '' ? { nombreHostelHotel: '', placeIdApi: null } : {}),
    }));
  };

  // Al elegir un lugar del buscador: guarda coordenadas y, si el alojamiento
  // tiene nombre propio en el mapa (hotel, hostel, departamento), lo completa.
  const tomarLugar = (lugar) => {
    setForm((f) => ({
      ...f,
      direccionTextual: lugar.direccion,
      latitud: lugar.latitud,
      longitud: lugar.longitud,
      placeIdApi: lugar.placeId,
      // Actualiza el nombre si el resultado pertenece a la categoría o si el campo estaba vacío
      nombreHostelHotel: lugar.categoria === 'alojamiento' ? lugar.nombre : f.nombreHostelHotel,
    }));
    setError('');
  };

  const siguiente = () => {
    const tieneDireccion = Boolean(form.direccionTextual.trim());
    const tieneNombre = Boolean(form.nombreHostelHotel.trim());

    // Si no hay dirección cargada, exigimos obligatoriamente el nombre
    if (!tieneDireccion && !tieneNombre) {
      return setError('Ingresá el nombre del alojamiento si no elegiste una dirección.');
    }

    // Experiencia sigue siendo obligatoria siempre
    if (!form.experiencia.trim()) {
      return setError('Contanos tu experiencia en el alojamiento.');
    }

    actualizar({
      alojamiento: {
        ...form,
        direccionTextual: form.direccionTextual.trim(),
        nombreHostelHotel: form.nombreHostelHotel.trim(),
        experiencia: form.experiencia.trim(),
      },
    });
    navigation.navigate('WizardGastronomia');
  };

  return (
    <Pantalla>
      <Titulo
        subtitulo={`¿Dónde te alojaste en ${borrador.ciudad?.nombre}? Buscá el hotel, hostel o departamento por su nombre, o escribí la dirección. También podés tocar el mapa para ajustar el pin.`}
      >
        Alojamiento
      </Titulo>

      <Mensaje texto={error} />

      <BuscadorDireccion
        valor={form.direccionTextual}
        onCambioTexto={handleCambioDireccion}
        onUbicacion={tomarLugar}
        codigoPais={borrador.pais?.codigoIso}
        ciudad={borrador.ciudad?.nombre}
        categoria="alojamiento"
        etiqueta="Buscar alojamiento o dirección"
        placeholder="Ej. Hostel Lagares, Av. San Martín 1200…"
      />

      <Input
        etiqueta="Nombre del hostel / hotel"
        value={form.nombreHostelHotel}
        onChangeText={cambiar('nombreHostelHotel')}
        placeholder="Ej. Hostel Lagares"
      />

      <View style={styles.mapa}>
        <MapaPicker
          latitud={form.latitud}
          longitud={form.longitud}
          titulo={form.nombreHostelHotel}
          onCambio={({ latitud, longitud }) => setForm((f) => ({ ...f, latitud, longitud }))}
        />
        <Text style={styles.ayuda}>
          {tieneUbicacion
            ? `📍 ${form.latitud.toFixed(5)}, ${form.longitud.toFixed(5)}`
            : 'Tocá el mapa para marcar el punto manualmente'}
        </Text>
      </View>

      <Input
        etiqueta="Tu experiencia"
        value={form.experiencia}
        onChangeText={cambiar('experiencia')}
        multiline
        placeholder="¿Cómo fue el lugar? Limpieza, ambiente, precio, ubicación…"
      />

      <WizardPie paso={2} onSiguiente={siguiente} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  mapa: { marginBottom: 14 },
  ayuda: { color: colors.textoSecundario, fontSize: 12, marginTop: 6 },
});