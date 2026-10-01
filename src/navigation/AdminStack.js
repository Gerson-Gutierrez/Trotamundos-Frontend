import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { opcionesHeader } from './tema';
import DashboardAdminScreen from '../screens/admin/DashboardAdminScreen';
import ModeracionReportesScreen from '../screens/admin/ModeracionReportesScreen';
import DetalleReporteAdminScreen from '../screens/admin/DetalleReporteAdminScreen';
import UsuariosAdminScreen from '../screens/admin/UsuariosAdminScreen';
import InvitarAdminScreen from '../screens/admin/InvitarAdminScreen';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={opcionesHeader}>
      <Stack.Screen name="DashboardAdmin" component={DashboardAdminScreen} options={{ title: 'Administración' }} />
      <Stack.Screen name="ModeracionReportes" component={ModeracionReportesScreen} options={{ title: 'Reportes' }} />
      <Stack.Screen name="DetalleReporteAdmin" component={DetalleReporteAdminScreen} options={{ title: 'Resolver reporte' }} />
      <Stack.Screen name="UsuariosAdmin" component={UsuariosAdminScreen} options={{ title: 'Usuarios' }} />
      <Stack.Screen name="InvitarAdmin" component={InvitarAdminScreen} options={{ title: 'Invitar administrador' }} />
    </Stack.Navigator>
  );
}
