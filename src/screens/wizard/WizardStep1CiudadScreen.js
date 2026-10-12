import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Mensaje from '../../components/common/Mensaje';
import SelectorPais from '../../components/common/SelectorPais';
import SelectorCiudad from '../../components/common/SelectorCiudad';
import WizardPie from '../../components/wizard/WizardPie';
import { mapasApi } from '../../api/mapasApi';
import { geocodingApi } from '../../api/geocodingApi';
import { usePaises } from '../../hooks/usePaises';
import { useWizard } from '../../hooks/useWizard';
import { mensajeError, nombrePais } from '../../utils/formatters';
import { t } from '../../i18n';

// Paso 1: el viajero registra el país y la ciudad donde está (obligatorio antes de publicar).
export default function WizardStep1CiudadScreen({ navigation, route }) {
  const { borrador, actualizar } = useWizard();
  const { porIso } = usePaises();
  const [pais, setPais] = useState(borrador.pais);
  const [ciudad, setCiudad] = useState(borrador.ciudad);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [ubicando, setUbicando] = useState(false);

  // País elegido desde el globo a pantalla completa (llega por params de navegación)
  useEffect(() => {
    if (route.params?.pais) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPais(route.params.pais);
      navigation.setParams({ pais: undefined });
    }
  }, [route.params?.pais, navigation]);

  const usarUbicacionActual = async () => {
    setError('');
    setUbicando(true);
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (!permiso.granted) return setError(t('Necesitamos permiso de ubicación para detectar dónde estás.'));

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lugar = await geocodingApi.inverso(pos.coords.latitude, pos.coords.longitude);
      const paisDetectado = lugar?.codigoPais ? porIso[lugar.codigoPais] : null;

      if (!paisDetectado) return setError(t('No pudimos determinar tu país. Elegilo manualmente.'));

      setPais(paisDetectado);
      setCiudad(lugar.ciudad ? { nombre: lugar.ciudad, esNueva: true } : null);
    } catch {
      setError(t('No se pudo obtener tu ubicación.'));
    } finally {
      setUbicando(false);
    }
  };

  const cambiarPais = (nuevo) => {
    // Si seleccionó "Usar mi ubicación actual" dentro del desplegable
    if (nuevo?.esUbicacionActual) {
      usarUbicacionActual();
      return;
    }

    setPais(nuevo);
    // Si la ciudad elegida pertenecía al país anterior, la limpiamos
    if (nuevo?.paisId !== pais?.paisId) setCiudad(null);
  };

  const siguiente = async () => {
    if (!pais) return setError(t('Elegí el país donde estás.'));
    if (!ciudad?.nombre?.trim()) return setError(t('Elegí la ciudad.'));
    setError('');
    setCargando(true);
    try {
      // Find-or-create en el backend: devuelve la ciudad con su id
      const registrada = await mapasApi.crearCiudad(pais.paisId, ciudad.nombre.trim());
      actualizar({ pais, ciudad: registrada });
      navigation.navigate('WizardAlojamiento');
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo subtitulo="Registrá el país y la ciudad donde estás. Así otros viajeros encuentran tu publicación desde el globo.">
        ¿Dónde estás?
      </Titulo>

      <Mensaje texto={error} />

      <SelectorPais
        valor={pais}
        onSeleccion={cambiarPais}
        cargandoUbicacion={ubicando}
      />

      <SelectorCiudad
        paisId={pais?.paisId}
        paisNombre={pais ? nombrePais(pais.codigoIso, pais.nombre) : undefined}
        valor={ciudad}
        onSeleccion={setCiudad}
      />

      <WizardPie paso={1} onSiguiente={siguiente} cargando={cargando} />
    </Pantalla>
  );
}
