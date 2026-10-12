import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/common/Pantalla';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Mensaje from '../../components/common/Mensaje';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { mensajeError } from '../../utils/formatters';
import { t } from '../../i18n';
import BotonIdioma from '../../components/common/BotonIdioma';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const ingresar = async () => {
    if (!email.trim() || !password) return setError(t('Completá email y contraseña.'));
    setError('');
    setCargando(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(mensajeError(e, 'Credenciales inválidas.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla contenidoStyle={styles.contenido}>
      <View style={styles.barraSuperior}>
        <BotonIdioma />
      </View>

      <View style={styles.logo}>
        <Image source={require('../../../assets/logo.png')} style={styles.logoImagen} resizeMode="contain" />
        <Text style={styles.nombre}>Trotamundos</Text>
        <Text style={styles.lema}>{t('Compartí tus viajes con el mundo')}</Text>
      </View>

      <Mensaje texto={error} />

      <Input etiqueta="Email" value={email} onChangeText={setEmail} placeholder="tu@email.com"
        autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <Input etiqueta="Contraseña" value={password} onChangeText={setPassword} placeholder="••••••••"
        secureTextEntry autoComplete="password" onSubmitEditing={ingresar} />

      <Button titulo="Ingresar" onPress={ingresar} cargando={cargando} />
      <Button titulo="Olvidé mi contraseña" variant="texto" onPress={() => navigation.navigate('OlvidoPassword')} />

      <View style={styles.pie}>
        <Text style={styles.pieTexto}>{t('¿No tenés cuenta?')}</Text>
        <Button titulo="Crear cuenta" variant="secundario" onPress={() => navigation.navigate('Register')} />
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  contenido: { flexGrow: 1 },
  barraSuperior: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  logo: { alignItems: 'center', marginBottom: 28 },
  logoImagen: { width: 220, height: 220 },
  nombre: { color: colors.primario, fontSize: 34, fontWeight: '900', marginTop: 4 },
  lema: { color: colors.textoSecundario, marginTop: 4 },
  pie: { marginTop: 28, gap: 10, alignItems: 'center' },
  pieTexto: { color: colors.textoSecundario },
});
