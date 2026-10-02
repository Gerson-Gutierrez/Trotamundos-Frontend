import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OlvidoPasswordScreen from '../screens/auth/OlvidoPasswordScreen';
import RestablecerPasswordScreen from '../screens/auth/RestablecerPasswordScreen';
import AceptarInvitacionAdminScreen from '../screens/auth/AceptarInvitacionAdminScreen';
import { opcionesHeader } from './tema';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={opcionesHeader}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
      <Stack.Screen name="OlvidoPassword" component={OlvidoPasswordScreen} options={{ title: 'Recuperar contraseña' }} />
      <Stack.Screen name="RestablecerPassword" component={RestablecerPasswordScreen} options={{ title: 'Nueva contraseña' }} />
      <Stack.Screen name="AceptarInvitacionAdmin" component={AceptarInvitacionAdminScreen} options={{ title: 'Activar cuenta' }} />
    </Stack.Navigator>
  );
}
