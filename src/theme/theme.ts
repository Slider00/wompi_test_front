import { StyleSheet, Platform } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

export const COLORS = {
  primary: '#5B21B6',      // Púrpura Premium vibrante
  primaryDark: '#4C1D95',  // Púrpura oscuro para estados activos
  secondary: '#10B981',    // Verde esmeralda (para estados exitosos/aprobados)
  danger: '#EF4444',       // Rojo (para errores/declinados)
  warning: '#F59E0B',      // Naranja (para transacciones pendientes)
  background: '#0F172A',   // Fondo azul pizarra muy oscuro (Modo oscuro premium/moderno)
  surface: '#1E293B',      // Superficie de tarjetas y contenedores (Gris azulado)
  surfaceLight: '#334155', // Bordes e inputs en foco
  text: '#F8FAFC',          // Texto principal (blanco roto)
  textSecondary: '#94A3B8', // Texto secundario / leyendas
  border: '#334155',
  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.75)'
};

export const SPACING = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  windowPadding: scale(20)
};

export const FONTS = {
  sizes: {
    xs: moderateScale(10),
    sm: moderateScale(12),
    md: moderateScale(14),
    lg: moderateScale(18),
    xl: moderateScale(22),
    xxl: moderateScale(32)
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const
  }
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4
  }
};

// Estilos globales reutilizables para toda la app (evita código duplicado)
export const GLOBAL_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: moderateScale(16),
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  input: {
    backgroundColor: COLORS.background,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: FONTS.sizes.md,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.sm - 2,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
