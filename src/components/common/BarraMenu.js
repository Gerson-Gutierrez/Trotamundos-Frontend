import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

// Rutas (en cualquier nivel de anidación) que pertenecen a cada opción del menú.
const OPCIONES_VIAJERO = [
  { clave: 'Inicio', etiqueta: 'Inicio', icono: ['home', 'home-outline'], rutas: ['Inicio', 'GlobeView'],
    // Siempre vuelve al feed completo: quita los filtros y recarga las publicaciones
    ir: (nav) => nav.navigate('MainTabs', { screen: 'Inicio', params: { reiniciar: Date.now() } }) },
  { clave: 'Publicar', etiqueta: 'Publicar', icono: ['add-circle', 'add-circle-outline'],
    rutas: ['WizardCiudad', 'WizardAlojamiento', 'WizardGastronomia', 'WizardRecomendaciones', 'WizardFotos', 'WizardConfirmar'],
    ir: (nav) => nav.navigate('Wizard') },
  { clave: 'Perfil', etiqueta: 'Perfil', icono: ['person', 'person-outline'], rutas: ['Perfil', 'EditarPerfil'],
    ir: (nav) => nav.navigate('MainTabs', { screen: 'Perfil' }) },
];

const OPCION_ADMIN = {
  clave: 'Admin', etiqueta: 'Admin', icono: ['shield-checkmark', 'shield-checkmark-outline'],
  rutas: ['DashboardAdmin', 'ModeracionReportes', 'DetalleReporteAdmin', 'UsuariosAdmin'],
  ir: (nav) => nav.navigate('MainTabs', { screen: 'Admin', params: { screen: 'DashboardAdmin' } }),
};

const OPCIONES_SUPERADMIN = [
  { clave: 'Panel', etiqueta: 'Panel', icono: ['grid', 'grid-outline'], rutas: ['DashboardSuperAdmin'],
    ir: (nav) => nav.navigate('DashboardSuperAdmin') },
  { clave: 'Admins', etiqueta: 'Admins', icono: ['shield-checkmark', 'shield-checkmark-outline'], rutas: ['CuentasAdmin'],
    ir: (nav) => nav.navigate('CuentasAdmin') },
  { clave: 'Invitar', etiqueta: 'Invitar', icono: ['mail', 'mail-outline'], rutas: ['InvitarCuenta'],
    ir: (nav) => nav.navigate('InvitarCuenta') },
  { clave: 'Bloqueados', etiqueta: 'Bloqueados', icono: ['ban', 'ban-outline'], rutas: ['CorreosBloqueados'],
    ir: (nav) => nav.navigate('CorreosBloqueados') },
];

// Menú inferior fijo, presente en todas las pantallas autenticadas. Se oculta mientras el teclado está abierto
// para no robarle espacio al campo que se está escribiendo.
export default function BarraMenu({ navegacion, rutaActual, esAdmin, esSuperAdmin }) {
  const insets = useSafeAreaInsets();
  const [tecladoVisible, setTecladoVisible] = useState(false);

  useEffect(() => {
    const mostrar = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const ocultar = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const a = Keyboard.addListener(mostrar, () => setTecladoVisible(true));
    const b = Keyboard.addListener(ocultar, () => setTecladoVisible(false));
    return () => { a.remove(); b.remove(); };
  }, []);

  if (tecladoVisible) return null;

  const opciones = esSuperAdmin
    ? OPCIONES_SUPERADMIN
    : esAdmin
      ? [OPCIONES_VIAJERO[0], OPCIONES_VIAJERO[2], OPCION_ADMIN]
      : OPCIONES_VIAJERO;

  return (
    <View style={[styles.barra, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {opciones.map((o) => {
        const activa = o.rutas.includes(rutaActual);
        const color = activa ? colors.primario : colors.textoSecundario;
        return (
          <Pressable key={o.clave} style={styles.item} onPress={() => o.ir(navegacion)} accessibilityRole="button">
            <Ionicons name={o.icono[activa ? 0 : 1]} size={22} color={color} />
            <Text style={[styles.etiqueta, { color }]} numberOfLines={1}>{o.etiqueta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    backgroundColor: colors.superficie,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
    paddingTop: 6,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, gap: 2 },
  etiqueta: { fontSize: 11, fontWeight: '600' },
});
