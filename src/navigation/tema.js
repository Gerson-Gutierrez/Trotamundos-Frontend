import { DarkTheme } from '@react-navigation/native';
import { colors } from '../constants/colors';

export const temaNavegacion = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.fondo,
    card: colors.superficie,
    text: colors.texto,
    border: colors.borde,
    primary: colors.primario,
  },
};

export const opcionesHeader = {
  headerStyle: { backgroundColor: colors.superficie },
  headerTintColor: colors.texto,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
};
