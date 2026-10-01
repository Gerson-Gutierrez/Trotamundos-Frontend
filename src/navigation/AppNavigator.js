import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { opcionesHeader, temaNavegacion } from './tema';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import PublicacionStack from './PublicacionStack';
import DetallePublicacionScreen from '../screens/publicaciones/DetallePublicacionScreen';
import EditarPerfilScreen from '../screens/main/EditarPerfilScreen';
import GlobeViewScreen from '../screens/main/GlobeViewScreen';

const Root = createNativeStackNavigator();

// Deep link del correo de invitación: /admin/register?token=XYZ (en web) o trotamundos://admin/register?token=XYZ
const linking = {
  prefixes: ['trotamundos://'],
  config: { screens: { AceptarInvitacionAdmin: 'admin/register' } },
};

// Enrutador raíz: decide entre el flujo de autenticación y la app.
export default function AppNavigator() {
  const { autenticado, cargandoSesion } = useAuth();

  if (cargandoSesion) return <LoadingSpinner mensaje="Cargando sesión…" />;

  return (
    <NavigationContainer theme={temaNavegacion} linking={linking}>
      {!autenticado ? (
        <AuthStack />
      ) : (
        <Root.Navigator screenOptions={opcionesHeader}>
          <Root.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
          <Root.Screen
            name="DetallePublicacion"
            component={DetallePublicacionScreen}
            options={{ title: 'Publicación' }}
          />
          {/* El wizard se abre sobre las tabs para que el flujo sea lineal */}
          <Root.Screen
            name="Wizard"
            component={PublicacionStack}
            options={{ headerShown: false, presentation: 'fullScreenModal' }}
          />
          <Root.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ title: 'Editar perfil' }} />
          <Root.Screen name="GlobeView" component={GlobeViewScreen} options={{ title: 'Elegí un país' }} />
        </Root.Navigator>
      )}
    </NavigationContainer>
  );
}
