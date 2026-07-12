import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONTS, SHADOWS } from '../theme/theme';
import { scale } from '../utils/responsive';
import { Security } from '../utils/security';

interface HeaderProps {
  onLogout: () => void;
}

/**
 * Header global de la aplicación para vistas autenticadas.
 * Muestra el logotipo de marca, la bienvenida al usuario logueado
 * y proporciona la acción de desconexión (Logout).
 */
export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');

  // Cargar el nombre del usuario desde el almacenamiento cifrado seguro
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userInfo = await Security.getSecureItem('user_info');
        if (userInfo && userInfo.name) {
          setUserName(userInfo.name);
        }
      } catch (error) {
        console.error('[Header] Error al cargar info del usuario:', error);
      }
    };
    loadUserData();
  }, []);

  const handleLogoutPress = async () => {
    try {
      await Security.removeSecureItem('auth_token');
      await Security.removeSecureItem('user_info');
      onLogout();
    } catch (error) {
      console.error('[Header] Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + SPACING.sm }]}>
      {/* Contenedor Izquierdo: Logotipo y Nombre de Marca */}
      <View style={styles.brandSection}>
        <View style={styles.miniLogoCircle}>
          <Text style={styles.miniLogoText}>W</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.brandName}>{t('auth.brand_name')}</Text>
          {userName ? (
            <Text style={styles.welcomeText} numberOfLines={1}>
              Hola, {userName}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Contenedor Derecho: Botón de Desconexión / Salir */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogoutPress}
        activeOpacity={0.7}
        testID="header-logout-btn"
        accessibilityLabel="Cerrar sesión"
      >
        {/* Ícono de salida estilizado con formas CSS nativas */}
        <View style={styles.iconCircle}>
          <Text style={styles.logoutIconSymbol}>⏻</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  miniLogoCircle: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogoText: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
    fontSize: scale(18),
  },
  textContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
    justifyContent: 'center',
  },
  brandName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.5,
  },
  welcomeText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm - 1,
    marginTop: scale(1),
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: 'rgba(239, 68, 68, 0.15)', // Fondo rojo traslúcido premium
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutIconSymbol: {
    color: COLORS.danger, // Símbolo rojo vibrante
    fontSize: scale(16),
    fontWeight: FONTS.weights.bold,
    lineHeight: scale(18),
  },
});

export default Header;
