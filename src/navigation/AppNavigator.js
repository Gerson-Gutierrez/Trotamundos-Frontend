import React, { useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import BarraMenu from '../components/common/BarraMenu';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { colors } from '../constants/colors';
import { opcionesHeader, temaNavegacion } from './tema';
import { t } from '../i18n';
import { useIdioma } from '../i18n/I18nProvider';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import PublicacionStack from './PublicacionStack';
import SuperAdminStack from './SuperAdminStack';
import DetallePublicacionScreen from '../screens/publicaciones/DetallePublicacionScreen';
import EditarPerfilScreen from '../screens/main/EditarPerfilScreen';
import GlobeViewScreen from '../screens/main/GlobeViewScreen';
import FavoritosScreen from '../screens/main/FavoritosScreen';

const Root = createNativeStackNavigator();
const navegacion = createNavigationContainerRef();

// Deep link del correo de invitación: /admin/register?token=XYZ (en web) o trotamundos://admin/register?token=XYZ
const linking = {
  prefixes: ['trotamundos://'],
  config: { screens: { AceptarInvitacionAdmin: 'admin/register' } },
};

// Enrutador raíz: decide entre el flujo de autenticación y la app.
export default function AppNavigator() {
  const { autenticado, esAdmin, esSuperAdmin, cargandoSesion } = useAuth();
  // Ruta visible (para resaltar el menú) y estado completo de la navegación.
  // Al cambiar de idioma la navegación se vuelve a montar con otra `key` para que todos los textos se redibujen;
  // el estado guardado permite volver a abrir la misma pantalla.
  const [nav, setNav] = useState({ ruta: null, estado: undefined, arbol: null });
  const rutaActual = nav.ruta;
  const { idioma } = useIdioma();
  // El estado solo vale mientras no cambie el tipo de navegación (acceso / viajero / superadmin)
  const arbol = !autenticado ? 'acceso' : esSuperAdmin ? 'superadmin' : 'app';
  const guardarNav = (estado) => setNav({ ruta: navegacion.getCurrentRoute()?.name ?? null, estado, arbol });

  if (cargandoSesion) return <LoadingSpinner mensaje="Cargando sesión…" />;

  return (
    <View key={idioma} style={{ flex: 1, backgroundColor: colors.fondo }}>
    <NavigationContainer
      ref={navegacion}
      initialState={nav.arbol === arbol ? nav.estado : undefined}
      theme={temaNavegacion}
      linking={linking}
      onReady={() => guardarNav(navegacion.getRootState())}
      onStateChange={guardarNav}
    >
      {!autenticado ? (
        <AuthStack />
      ) : esSuperAdmin ? (
        // El superadministrador tiene su propia interfaz, sin las tabs de viajero ni el panel de admins
        <SuperAdminStack />
      ) : (
        <Root.Navigator screenOptions={opcionesHeader}>
          <Root.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
          <Root.Screen
            name="DetallePublicacion"
            component={DetallePublicacionScreen}
            options={{ title: t('Publicación') }}
          />
          {/* El wizard no es modal para que el menú inferior siga visible */}
          <Root.Screen
            name="Wizard"
            component={PublicacionStack}
            options={{ headerShown: false }}
          />
          <Root.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ title: t('Editar perfil') }} />
          <Root.Screen name="Favoritos" component={FavoritosScreen} options={{ title: t('Favoritos') }} />
          <Root.Screen name="GlobeView" component={GlobeViewScreen} options={{ title: t('Elegí un país') }} />
        </Root.Navigator>
      )}
    </NavigationContainer>
    {autenticado && (
      <BarraMenu navegacion={navegacion} rutaActual={rutaActual} esAdmin={esAdmin} esSuperAdmin={esSuperAdmin} />
    )}
    </View>
  );
}
