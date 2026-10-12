import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { opcionesHeader } from './tema';
import { t } from '../i18n';
import DashboardSuperAdminScreen from '../screens/superadmin/DashboardSuperAdminScreen';
import CuentasAdminScreen from '../screens/superadmin/CuentasAdminScreen';
import InvitarCuentaScreen from '../screens/superadmin/InvitarCuentaScreen';
import CorreosBloqueadosScreen from '../screens/superadmin/CorreosBloqueadosScreen';

const Stack = createNativeStackNavigator();

// Interfaz exclusiva del superadministrador: no comparte pantallas con el panel de administradores.
export default function SuperAdminStack() {
  return (
    <Stack.Navigator screenOptions={opcionesHeader}>
      <Stack.Screen name="DashboardSuperAdmin" component={DashboardSuperAdminScreen} options={{ title: t('Superadministración') }} />
      <Stack.Screen name="CuentasAdmin" component={CuentasAdminScreen} options={{ title: t('Administradores') }} />
      <Stack.Screen name="InvitarCuenta" component={InvitarCuentaScreen} options={{ title: t('Enviar invitación') }} />
      <Stack.Screen name="CorreosBloqueados" component={CorreosBloqueadosScreen} options={{ title: t('Correos bloqueados') }} />
    </Stack.Navigator>
  );
}
