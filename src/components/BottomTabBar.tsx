import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabBarIcon } from './TabBarIcon';
import { COLORS, SPACING, FONTS, SHADOWS } from '../theme/theme';
import { scale, moderateScale } from '../utils/responsive';
import { useAppSelector } from '../store';

interface BottomTabBarProps {
  currentScreen: 'PRODUCTS' | 'PAYMENT' | 'STATUS' | 'HISTORY';
  onNavigate: (screen: 'PRODUCTS' | 'PAYMENT' | 'STATUS' | 'HISTORY') => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const cart = useAppSelector((state) => state.payment.cart);

  const tabs = [
    {
      id: 'PRODUCTS' as const,
      label: t('products.title'),
      iconName: 'products' as const,
    },
    {
      id: 'PAYMENT' as const,
      label: t('checkout'),
      iconName: 'card' as const,
    },
    {
      id: 'HISTORY' as const,
      label: t('history.title'),
      iconName: 'history' as const,
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            style={styles.tabButton}
            onPress={() => {
              if (tab.id === 'PAYMENT' && cart.length === 0) {
                Alert.alert(
                  t('cart_empty_title', { defaultValue: 'Carrito Vacío' }),
                  t('cart_empty_desc', { defaultValue: 'Por favor, selecciona al menos un producto para proceder al pago.' }),
                  [{ text: t('ok', { defaultValue: 'Aceptar' }) }]
                );
                return;
              }
              onNavigate(tab.id);
            }}
          >
            <TabBarIcon name={tab.iconName} active={isActive} />
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.md, // Espacio extra para zona segura del Home Indicator en iOS
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    marginTop: scale(4),
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
  tabLabelInactive: {
    color: COLORS.textSecondary,
  },
});

export default BottomTabBar;
