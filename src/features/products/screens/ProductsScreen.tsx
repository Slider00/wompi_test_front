import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../store';
import { setPendingAmount } from '../../payment/store/paymentSlice';
import { RootContainer } from '../../../components/RootContainer';
import { GLOBAL_STYLES, COLORS, SPACING, FONTS } from '../../../theme/theme';
import { scale } from '../../../utils/responsive';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Auriculares Bluetooth Pro',
    description: 'Cancelación activa de ruido, batería de 30 horas y sonido premium.',
    price: 249900,
    icon: '🎧',
  },
  {
    id: 'prod-2',
    name: 'Reloj Inteligente Fit',
    description: 'Pantalla AMOLED, monitoreo de salud 24/7 y GPS integrado.',
    price: 379900,
    icon: '⌚',
  },
  {
    id: 'prod-3',
    name: 'Teclado Mecánico RGB',
    description: 'Switches mecánicos táctiles, retroiluminación RGB y conexión inalámbrica.',
    price: 189900,
    icon: '⌨️',
  },
  {
    id: 'prod-4',
    name: 'Cargador Inalámbrico Rápido',
    description: 'Carga magnética de 15W compatible con múltiples dispositivos.',
    price: 89900,
    icon: '⚡',
  },
];

interface ProductsScreenProps {
  onNavigateToPayment: () => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({ onNavigateToPayment }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleIncrement = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const handleDecrement = (productId: string) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      if (current <= 0) return prev;
      return {
        ...prev,
        [productId]: current - 1,
      };
    });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalItems = Object.values(quantities).reduce((acc, q) => acc + q, 0);
  const totalPrice = PRODUCTS.reduce((acc, p) => acc + (quantities[p.id] || 0) * p.price, 0);

  const handleCheckout = () => {
    if (totalPrice <= 0) return;
    dispatch(setPendingAmount(totalPrice));
    onNavigateToPayment();
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const qty = quantities[item.id] || 0;
    const isSelected = qty > 0;

    return (
      <View style={[GLOBAL_STYLES.card, styles.productCard, isSelected ? styles.productCardActive : null]}>
        <View style={styles.productLeft}>
          <View style={styles.iconContainer}>
            <Text style={styles.productIcon}>{item.icon}</Text>
          </View>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        </View>

        <View style={styles.counterContainer}>
          <TouchableOpacity 
            style={[styles.counterButton, qty === 0 ? styles.counterButtonDisabled : null]}
            onPress={() => handleDecrement(item.id)}
            disabled={qty === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.counterValue}>{qty}</Text>
          
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => handleIncrement(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <RootContainer scrollEnabled={false} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={GLOBAL_STYLES.headerTitle}>{t('products.title')}</Text>
        <Text style={GLOBAL_STYLES.headerSubtitle}>{t('products.subtitle')}</Text>
      </View>

      <FlatList
        data={PRODUCTS}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {totalItems > 0 && (
        <View style={styles.checkoutBar}>
          <View style={styles.checkoutDetails}>
            <Text style={styles.totalLabel}>{t('products.total_label')}</Text>
            <Text style={styles.totalItemsText}>
              {totalItems} {t('products.items_selected')}
            </Text>
            <Text style={styles.totalPriceText}>{formatPrice(totalPrice)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutButtonText}>{t('products.btn_checkout')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </RootContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  listContent: {
    paddingBottom: scale(100),
    paddingHorizontal: SPACING.sm,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  productCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  productLeft: {
    marginRight: SPACING.md,
  },
  iconContainer: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    backgroundColor: 'rgba(91, 33, 182, 0.15)', // light translucent primary
    alignItems: 'center',
    justifyContent: 'center',
  },
  productIcon: {
    fontSize: scale(22),
  },
  productInfo: {
    flex: 1,
    paddingRight: SPACING.xs,
  },
  productName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: scale(2),
  },
  productDescription: {
    fontSize: scale(11),
    color: COLORS.textSecondary,
    marginBottom: scale(6),
    lineHeight: scale(14),
  },
  productPrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: scale(20),
    paddingHorizontal: scale(4),
    paddingVertical: scale(4),
  },
  counterButton: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.4,
  },
  counterButtonText: {
    color: COLORS.text,
    fontSize: scale(16),
    fontWeight: FONTS.weights.bold,
  },
  counterValue: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    marginHorizontal: scale(8),
    minWidth: scale(16),
    textAlign: 'center',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  checkoutDetails: {
    flex: 1,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontSize: scale(11),
    fontWeight: FONTS.weights.medium,
    textTransform: 'uppercase',
  },
  totalItemsText: {
    color: COLORS.textSecondary,
    fontSize: scale(11),
    marginBottom: scale(2),
  },
  totalPriceText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: scale(10),
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginLeft: SPACING.md,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    textAlign: 'center',
  },
});

export default ProductsScreen;
