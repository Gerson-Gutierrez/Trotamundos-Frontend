import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OlvidoPasswordScreen from '../screens/auth/OlvidoPasswordScreen';
import RestablecerPasswordScreen from '../screens/auth/RestablecerPasswordScreen';
import AceptarInvitacionAdminScreen from '../screens/auth/AceptarInvitacionAdminScreen';
import { opcionesHeader } from './tema';
import { t } from '../i18n';
import BotonIdioma from '../components/common/BotonIdioma';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    // El botón de idioma está disponible en todas las pantallas de acceso (el login no tiene cabecera y lo lleva dentro)
    <Stack.Navigator screenOptions={{ ...opcionesHeader, headerRight: () => <BotonIdioma /> }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('Crear cuenta') }} />
      <Stack.Screen name="OlvidoPassword" component={OlvidoPasswordScreen} options={{ title: t('Recuperar contraseña') }} />
      <Stack.Screen name="RestablecerPassword" component={RestablecerPasswordScreen} options={{ title: t('Nueva contraseña') }} />
      <Stack.Screen name="AceptarInvitacionAdmin" component={AceptarInvitacionAdminScreen} options={{ title: t('Activar cuenta') }} />
    </Stack.Navigator>
  );
}
