import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { opcionesHeader } from './tema';
import { t } from '../i18n';
import DashboardAdminScreen from '../screens/admin/DashboardAdminScreen';
import ModeracionReportesScreen from '../screens/admin/ModeracionReportesScreen';
import DetalleReporteAdminScreen from '../screens/admin/DetalleReporteAdminScreen';
import UsuariosAdminScreen from '../screens/admin/UsuariosAdminScreen';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={opcionesHeader}>
      <Stack.Screen name="DashboardAdmin" component={DashboardAdminScreen} options={{ title: t('Administración') }} />
      <Stack.Screen name="ModeracionReportes" component={ModeracionReportesScreen} options={{ title: t('Reportes') }} />
      <Stack.Screen name="DetalleReporteAdmin" component={DetalleReporteAdminScreen} options={{ title: t('Resolver reporte') }} />
      <Stack.Screen name="UsuariosAdmin" component={UsuariosAdminScreen} options={{ title: t('Usuarios') }} />
    </Stack.Navigator>
  );
}
