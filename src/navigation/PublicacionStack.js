import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WizardProvider } from '../context/WizardContext';
import { opcionesHeader } from './tema';
import { t } from '../i18n';
import WizardStep1CiudadScreen from '../screens/wizard/WizardStep1CiudadScreen';
import WizardStep2AlojamientoScreen from '../screens/wizard/WizardStep2AlojamientoScreen';
import WizardStep3GastronomiaScreen from '../screens/wizard/WizardStep3GastronomiaScreen';
import WizardStep4RecomendacionesScreen from '../screens/wizard/WizardStep4RecomendacionesScreen';
import WizardStep5FotosScreen from '../screens/wizard/WizardStep5FotosScreen';
import WizardStep6ConfirmarScreen from '../screens/wizard/WizardStep6ConfirmarScreen';

const Stack = createNativeStackNavigator();

// Wizard de creación de publicación. El WizardProvider vive acá para que el
// borrador se descarte al cerrar el flujo.
export default function PublicacionStack() {
  return (
    <WizardProvider>
      <Stack.Navigator screenOptions={opcionesHeader}>
        <Stack.Screen name="WizardCiudad" component={WizardStep1CiudadScreen} options={{ title: t('Paso 1 · Ubicación') }} />
        <Stack.Screen name="WizardAlojamiento" component={WizardStep2AlojamientoScreen} options={{ title: t('Paso 2 · Alojamiento') }} />
        <Stack.Screen name="WizardGastronomia" component={WizardStep3GastronomiaScreen} options={{ title: t('Paso 3 · Comidas') }} />
        <Stack.Screen name="WizardRecomendaciones" component={WizardStep4RecomendacionesScreen} options={{ title: t('Paso 4 · Recomendaciones') }} />
        <Stack.Screen name="WizardFotos" component={WizardStep5FotosScreen} options={{ title: t('Paso 5 · Imágenes') }} />
        <Stack.Screen name="WizardConfirmar" component={WizardStep6ConfirmarScreen} options={{ title: t('Paso 6 · Confirmar') }} />
      </Stack.Navigator>
    </WizardProvider>
  );
}
