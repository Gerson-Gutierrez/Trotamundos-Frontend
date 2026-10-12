import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Titulo from '../../components/common/Titulo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import BuscadorAgencia from '../../components/wizard/BuscadorAgencia';
import WizardPie from '../../components/wizard/WizardPie';
import { colors } from '../../constants/colors';
import { useWizard } from '../../hooks/useWizard';
import { usePrecargaLugares } from '../../hooks/usePrecargaLugares';
import { normalizarUrl, sinProtocolo } from '../../utils/formatters';
import { t } from '../../i18n';
import Icono, { TextoIcono } from '../../components/common/Icono';

const agenciaVacia = { nombre: '', sitioWeb: '' };

// Paso 4: lugares para recorrer, actividades y agencias de turismo (opcionales).
// De la agencia interesa el nombre y su web: en la publicación se muestra como enlace.
export default function WizardStep4RecomendacionesScreen({ navigation }) {
  const { borrador, actualizar } = useWizard();
  const [contenido, setContenido] = useState(borrador.recomendacion?.contenido || '');
  const [agencias, setAgencias] = useState(borrador.recomendacion?.agencias || []);
  const [agregando, setAgregando] = useState(false);
  const [nueva, setNueva] = useState(agenciaVacia);
  const [error, setError] = useState('');

  // Deja listo el listado de la ciudad mientras el usuario lee la pantalla
  usePrecargaLugares('agencia', borrador.ciudad?.nombre, borrador.pais?.codigoIso);

  // Al elegir una agencia de la búsqueda se completan su nombre y su página,
  // que es lo que después se muestra como enlace en la publicación.
  const tomarAgencia = (agencia) => {
    setNueva((n) => ({ ...n, nombre: agencia.nombre, sitioWeb: agencia.url }));
    setError('');
  };

  const agregarAgencia = () => {
    if (!nueva.nombre.trim()) return setError(t('Ingresá el nombre de la agencia.'));
    setError('');
    setAgencias((a) => [
      ...a,
      {
        ...nueva,
        nombre: nueva.nombre.trim(),
        sitioWeb: normalizarUrl(nueva.sitioWeb),
      },
    ]);
    setNueva(agenciaVacia);
    setAgregando(false);
  };

  const quitar = (i) => setAgencias((a) => a.filter((_, idx) => idx !== i));

  const guardar = () => {
    if (!contenido.trim()) {
      return setError(t('Contanos sobre los lugares que recorriste o las actividades que hiciste.'));
    }

    setError('');
    actualizar({
      recomendacion: {
        contenido: contenido.trim(),
        agencias,
      },
    });
    navigation.navigate('WizardFotos');
  };

  return (
    <Pantalla>
      <Titulo subtitulo="¿Qué lugares se pueden recorrer? ¿Qué actividades hiciste? Contá tu experiencia y, si querés, agregá las agencias de turismo que usaste.">
        Recomendaciones y actividades
      </Titulo>

      <Mensaje texto={error} />

      <Input
        etiqueta="Lugares y actividades"
        value={contenido}
        onChangeText={(v) => {
          setContenido(v);
          if (error) setError('');
        }}
        multiline
        inputStyle={{ minHeight: 160 }}
        placeholder="Ej. Recomiendo el tour por las bodegas, salir temprano al Cerro de la Gloria, evitar el centro los domingos…"
      />

      <Text style={styles.subtitulo}>{t('Agencias de turismo')}</Text>

      {agencias.map((a, i) => (
        <View key={i} style={styles.agencia}>
          <View style={{ flex: 1 }}>
            <TextoIcono icono="agencia" color={colors.primario} style={styles.agenciaNombre}>{a.nombre}</TextoIcono>
            {a.sitioWeb ? (
              <TextoIcono icono="web" size={13} color={colors.primario} style={styles.agenciaWeb} numberOfLines={1}
                contenedorStyle={styles.agenciaFila}>
                {sinProtocolo(a.sitioWeb)}
              </TextoIcono>
            ) : (
              <Text style={styles.agenciaDato}>{t('Sin página web')}</Text>
            )}
          </View>
          <Pressable onPress={() => quitar(i)} hitSlop={8} accessibilityLabel={t('Quitar')}>
            <Icono nombre="cerrar" size={20} color={colors.peligro} />
          </Pressable>
        </View>
      ))}

      {!agregando ? (
        <Button
          titulo="Agregar agencia de turismo"
          icono="mas"
          variant="secundario"
          onPress={() => setAgregando(true)}
          style={styles.espacio}
        />
      ) : (
        <View style={styles.formulario}>
          <Text style={styles.formularioTitulo}>{t('Nueva agencia de turismo')}</Text>

          <BuscadorAgencia
            valor={nueva.nombre}
            onCambioTexto={(v) => setNueva((n) => ({ ...n, nombre: v }))}
            onSeleccion={tomarAgencia}
            codigoPais={borrador.pais?.codigoIso}
            ciudad={borrador.ciudad?.nombre}
          />

          <Input
            etiqueta="Página web"
            value={nueva.sitioWeb}
            onChangeText={(v) => setNueva((n) => ({ ...n, sitioWeb: v }))}
            placeholder="Ej. turismotastil.com.ar"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Text style={styles.ayuda}>
            {t('Se completa sola al elegir una agencia de la lista. Si no aparece, escribila acá.')}
          </Text>

          <View style={styles.acciones}>
            <Button
              titulo="Cancelar"
              variant="texto"
              onPress={() => {
                setAgregando(false);
                setNueva(agenciaVacia);
                setError('');
              }}
              style={{ flex: 1 }}
            />
            <Button titulo="Agregar" onPress={agregarAgencia} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      <WizardPie paso={4} onSiguiente={guardar} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  espacio: { marginBottom: 10 },
  subtitulo: { color: colors.texto, fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 10 },
  agencia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  agenciaNombre: { color: colors.texto, fontWeight: '700' },
  agenciaDato: { color: colors.textoSecundario, fontSize: 12, marginTop: 2 },
  agenciaFila: { marginTop: 2 },
  agenciaWeb: { color: colors.primario, fontSize: 12 },
  formulario: {
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.primario,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  formularioTitulo: { color: colors.primario, fontWeight: '700', marginBottom: 10 },
  ayuda: { color: colors.textoSecundario, fontSize: 12, marginTop: -6, marginBottom: 12 },
  acciones: { flexDirection: 'row', gap: 10 },
});