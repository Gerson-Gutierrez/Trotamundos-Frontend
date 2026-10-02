
import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import HomeScreen from '../screens/main/HomeScreen';
import PerfilScreen from '../screens/main/PerfilScreen';
import AdminStack from './AdminStack';

const Tab = createBottomTabNavigator();

const iconos = {
  Inicio: ['home', 'home-outline'],
  Publicar: ['add-circle', 'add-circle-outline'],
  Perfil: ['person', 'person-outline'],
  Admin: ['shield-checkmark', 'shield-checkmark-outline'],
};

// Pantalla vacía: la tab "Publicar" solo redirige al wizard (que se abre sobre las tabs)
function Vacia() {
  return <View />;
}

export default function MainTabNavigator() {
  const { esAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primario,
        tabBarInactiveTintColor: colors.textoSecundario,
        tabBarStyle: { backgroundColor: colors.superficie, borderTopColor: colors.borde },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={iconos[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      
      {/* Oculta la pestaña de Publicar si el usuario es administrador */}
      {!esAdmin && (
        <Tab.Screen
          name="Publicar"
          component={Vacia}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('Wizard');
            },
          })}
        />
      )}

      <Tab.Screen name="Perfil" component={PerfilScreen} />
      {esAdmin && <Tab.Screen name="Admin" component={AdminStack} />}
    </Tab.Navigator>
  );
}